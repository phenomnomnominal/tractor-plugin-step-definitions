/* global describe:true, it:true */

// Test setup:
import { expect, Promise, sinon } from '../../../../test-setup';

// Dependencies:
import path from 'path';
import { JavaScriptFile } from 'tractor-file-javascript';
import { FileStructure } from 'tractor-file-structure';
import { StepDefinitionFileRefactorer } from './step-definition-file-refactorer';

// Under test:
import { StepDefinitionFile } from './step-definition-file';

describe('tractor-plugin-step-definitions - step-definition-file:', () => {
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
            sinon.stub(StepDefinitionFileRefactorer, 'referenceNameChange');

            let file = new StepDefinitionFile(filePath, fileStructure);
            let data = {};

            return file.refactor('referenceNameChange', data)
            .then(() => {
                expect(StepDefinitionFileRefactorer.referenceNameChange).to.have.been.calledWith(file, data);
            })
            .finally(() => {
                JavaScriptFile.prototype.refactor.restore();
                StepDefinitionFile.prototype.save.restore();
                StepDefinitionFileRefactorer.referenceNameChange.restore();
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
});
