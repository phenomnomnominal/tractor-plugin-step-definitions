/* global describe:true, it:true */

// Utilities:
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import path from 'path';
import Promise from 'bluebird';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(dirtyChai);
chai.use(sinonChai);

// Dependencies:
import * as esprima from 'esprima';
import { JavaScriptFile } from 'tractor-file-javascript';
import { FileStructure } from 'tractor-file-structure';
import { StepDefinitionFileRefactorer } from './step-definition-file-refactorer';

// Under test:
import { StepDefinitionFile } from './step-definition-file';

describe('tractor-plugin-step-definitions - StepDefinitionFile:', () => {
    describe('StepDefinitionFile constructor:', () => {
        it('should create a new StepDefinitionFile', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new StepDefinitionFile(filePath, fileStructure);

            expect(file).to.be.an.instanceof(StepDefinitionFile);
        });

        it('should inherit from JavaScriptFile', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            let file = new StepDefinitionFile(filePath, fileStructure);

            expect(file).to.be.an.instanceof(JavaScriptFile);
        });
    });

    describe('StepDefinitionFile.move:', () => {
        it('should move the file', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.step.js');
            let file = new StepDefinitionFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.step.js');
            let newFile = new StepDefinitionFile(newFilePath, fileStructure);

            sinon.stub(JavaScriptFile.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());

            let update = {
                newPath: newFile.path
            };
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(JavaScriptFile.prototype.move).to.have.been.calledWith(update, options);
            })
            .finally(() => {
                JavaScriptFile.prototype.move.restore();
                JavaScriptFile.prototype.save.restore();
            });
        });

        it('should update the require path to the page object in files that reference it', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.step.js');
            let file = new StepDefinitionFile(filePath, fileStructure);
            let newFilePath = path.join(path.sep, 'file-structure', 'directory', 'new file.step.js');
            let newFile = new StepDefinitionFile(newFilePath, fileStructure);
            let referenceFilePath = path.join(path.sep, 'file-structure', 'directory', 'reference file.step.js');
            let referenceFile = new StepDefinitionFile(referenceFilePath, fileStructure);

            sinon.stub(fileStructure.references, 'getReferencesFrom').returns([referenceFile]);
            sinon.stub(JavaScriptFile.prototype, 'move').returns(Promise.resolve(newFile));
            sinon.stub(StepDefinitionFile.prototype, 'refactor').returns(Promise.resolve());

            let update = {
                newPath: newFile.path
            };
            let options = {};

            return file.move(update, options)
            .then(() => {
                expect(newFile.refactor).to.have.been.calledWith('referencePathChange', {
                    oldFromPath: file.path,
                    newFromPath: newFile.path,
                    toPath: referenceFile.path
                });
            })
            .finally(() => {
                JavaScriptFile.prototype.move.restore();
                StepDefinitionFile.prototype.refactor.restore();
            });
        });
    });

    describe('StepDefinitionFile.read:', () => {
        it('should read the file from disk', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            sinon.stub(JavaScriptFile.prototype, 'read').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure);

            return file.read()
            .then(() => {
                expect(JavaScriptFile.prototype.read).to.have.been.called();
            })
            .finally(() => {
                JavaScriptFile.prototype.read.restore();
            });
        });

        it('should update the references between files', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file'), fileStructure);
            let otherFile = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'other-file'), fileStructure);

            sinon.stub(JavaScriptFile.prototype, 'read').returns(Promise.resolve());

            file.ast = esprima.parseScript(`var someReference = require('./other-file');`);

            return file.read()
            .then(() => {
                expect(fileStructure.references.getReferencesTo(otherFile.path)).to.deep.equal([file]);
                expect(fileStructure.references.getReferencesFrom(file.path)).to.deep.equal([otherFile]);
            })
            .finally(() => {
                JavaScriptFile.prototype.read.restore();
            });
        });

        it('should set `isPending` to true if a step definition is pending', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            sinon.stub(JavaScriptFile.prototype, 'read').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure);
            file.ast = esprima.parseScript(`callback('pending');`);

            return file.read()
            .then(() => {
                expect(file.isPending).to.equal(true);
            })
            .finally(() => {
                JavaScriptFile.prototype.read.restore();
            });
        });

        it('should set `isPending` to false if a step definition is completed', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file');

            sinon.stub(JavaScriptFile.prototype, 'read').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure);
            file.ast = esprima.parseScript(`callback('not-pending');`);

            return file.read()
            .then(() => {
                expect(file.isPending).to.equal(false);
            })
            .finally(() => {
                JavaScriptFile.prototype.read.restore();
            });
        });
    });

    describe('StepDefinitionFile.refactor:', () => {
        it('should refactor a StepDefinition file', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.js');

            sinon.stub(JavaScriptFile.prototype, 'refactor').returns(Promise.resolve());
            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure);

            return file.refactor('refactor')
            .then(() => {
                expect(JavaScriptFile.prototype.refactor).to.have.been.calledWith('refactor');
            })
            .finally(() => {
                JavaScriptFile.prototype.refactor.restore();
                StepDefinitionFile.prototype.save.restore();
            });
        });

        it('should call the appropriate action on the StepDefinitionFileRefactorer', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.js');

            sinon.stub(JavaScriptFile.prototype, 'refactor').returns(Promise.resolve());
            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());
            sinon.stub(StepDefinitionFileRefactorer, 'mockRequestFileNameChange');

            let file = new StepDefinitionFile(filePath, fileStructure);
            let data = {};

            return file.refactor('mockRequestFileNameChange', data)
            .then(() => {
                expect(StepDefinitionFileRefactorer.mockRequestFileNameChange).to.have.been.calledWith(file, data);
            })
            .finally(() => {
                JavaScriptFile.prototype.refactor.restore();
                StepDefinitionFile.prototype.save.restore();
                StepDefinitionFileRefactorer.mockRequestFileNameChange.restore();
            });
        });

        it(`should do nothing if the action doesn't exist the StepDefinitionFileRefactorer`, done => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.js');

            sinon.stub(JavaScriptFile.prototype, 'refactor').returns(Promise.resolve());
            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure);
            let data = {};

            file.refactor('someRefactorAction', data)
            .then(done)
            .catch(done.fail)
            .finally(() => {
                JavaScriptFile.prototype.refactor.restore();
                StepDefinitionFile.prototype.save.restore();
            });
        });

        it('should save the StepDefinitionFile file after it has been refactored', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let filePath = path.join(path.sep, 'file-structure', 'directory', 'file.js');

            sinon.stub(JavaScriptFile.prototype, 'refactor').returns(Promise.resolve());
            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());

            let file = new StepDefinitionFile(filePath, fileStructure)

            return file.refactor('refactor')
            .then(() => {
                expect(StepDefinitionFile.prototype.save).to.have.been.called();
            })
            .finally(() => {
                JavaScriptFile.prototype.refactor.restore();
                StepDefinitionFile.prototype.save.restore();
            });
        });
    });

    describe('StepDefinitionFile.save:', () => {
        it('should save the file to disk', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file'), fileStructure);
            let ast = esprima.parseScript('');

            sinon.stub(JavaScriptFile.prototype, 'save').returns(Promise.resolve());

            return file.save(ast)
            .then(() => {
                expect(JavaScriptFile.prototype.save).to.have.been.called();
            })
            .finally(() => {
                JavaScriptFile.prototype.save.restore();
            });
        });

        it('should update the references between files', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file'), fileStructure);
            let otherFile = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'other-directory', 'file'), fileStructure);
            let content = `var someReference = require('../other-directory/file');`
            let ast = esprima.parseScript(content);

            // Hack:
            // Using JavaScriptFile.prototype.__proto__ to get access to the File prototype...
            // Definitely need a better approach than this.
            sinon.stub(JavaScriptFile.prototype.__proto__, 'save').returns(Promise.resolve(content));

            return file.save(ast)
            .then(() => {
                expect(fileStructure.references.getReferencesTo(otherFile.path)).to.deep.equal([file]);
                expect(fileStructure.references.getReferencesFrom(file.path)).to.deep.equal([otherFile]);
            })
            .finally(() => {
                JavaScriptFile.prototype.__proto__.save.restore();
            });
        });

        it('should remove any references that are no longer relevant', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file'), fileStructure);
            let otherFile = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'other-directory', 'file'), fileStructure);
            fileStructure.references.addReference(otherFile, file);
            var content = '';
            let ast = esprima.parseScript(content);

            // Hack:
            // Using JavaScriptFile.prototype.__proto__ to get access to the File prototype...
            // Definitely need a better approach than this.
            sinon.stub(JavaScriptFile.prototype.__proto__, 'save').returns(Promise.resolve(content));

            return file.save(ast)
            .then(() => {
                expect(fileStructure.references.getReferencesTo(otherFile)).to.deep.equal([]);
            })
            .finally(() => {
                JavaScriptFile.prototype.__proto__.save.restore();
            });
        });
    });
});
