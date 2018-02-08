/* global describe:true, it:true */

// Test setup:
import { expect, Promise, sinon } from '@tractor/unit-test';
import dedent from 'dedent';

// Utilities:
import escodegen from 'escodegen';
import * as esprima from 'esprima';
import path from 'path';

// Dependencies:
import { FileStructure } from '@tractor/file-structure';
import { StepDefinitionFile } from './step-definition-file';

// Under test:
import { StepDefinitionFileRefactorer } from './step-definition-file-refactorer';

describe('tractor-plugin-page-objects: step-definition-file-refactorer:', () => {
    describe('StepDefinitionFileRefactorer.referenceNameChange', () => {
        it('should update the name of a mock request file in a step definition', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file.step.js'), fileStructure);

            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());

            file.ast = esprima.parseScript(`
                /*{"name":"Given something","pageObjects":[],"mockRequests":[{"name":"foo"}]}*/
                module.exports = function () {
                    var foo = require('../mock-requests/foo.mock.json');
                    this.Given(/^something$/, function (done) {
                        Promise.all([
                            mockRequests.whenGET(/foo/, {
                                body: foo,
                                status: 200
                            })
                        ]).spread(function () {
                            done();
                        }).catch(done.fail);
                    });
                };
            `, {
                comment: true
            });

            return StepDefinitionFileRefactorer.referenceNameChange(file, {
                oldName: 'foo',
                newName: 'bar',
                extension: '.mock.json'
            })
            .then(() => {
                file.ast.leadingComments = file.ast.comments;
                let stepDefinition = escodegen.generate(file.ast, {
                    comment: true
                });

                expect(stepDefinition).to.equal(dedent(`
                    /*{"name":"Given something","pageObjects":[],"mockRequests":[{"name":"bar"}]}*/
                    module.exports = function () {
                        var bar = require('../mock-requests/foo.mock.json');
                        this.Given(/^something$/, function (done) {
                            Promise.all([mockRequests.whenGET(/foo/, {
                                    body: bar,
                                    status: 200
                                })]).spread(function () {
                                done();
                            }).catch(done.fail);
                        });
                    };
                `));
            })
            .finally(() => {
                StepDefinitionFile.prototype.save.restore();
            });
        });

        it('should update the name of a page object file in a step definition', () => {
            let fileStructure = new FileStructure(path.join(path.sep, 'file-structure'));
            let file = new StepDefinitionFile(path.join(path.sep, 'file-structure', 'directory', 'file.step.js'), fileStructure);

            sinon.stub(StepDefinitionFile.prototype, 'save').returns(Promise.resolve());

            file.ast = esprima.parseScript(`
                /*{"name":"When something","pageObjects":[{"name":"foo"}],"mockRequests":[]}*/
                module.exports = function () {
                    var Foo = require('../page-objects/foo.po.js'), foo = new Foo();
                    this.When(/^something$/, function (done) {
                        var tasks = foo.baz(tag).then(function () {
                            return foo.bop();
                        });
                        Promise.resolve(tasks).then(done).catch(done.fail);
                    });
                };
            `, {
                comment: true
            });

            return StepDefinitionFileRefactorer.referenceNameChange(file, {
                oldName: 'foo',
                newName: 'bar',
                extension: '.po.js'
            })
            .then(() => {
                file.ast.leadingComments = file.ast.comments;
                let stepDefinition = escodegen.generate(file.ast, {
                    comment: true
                });

                expect(stepDefinition).to.equal(dedent(`
                    /*{"name":"When something","pageObjects":[{"name":"bar"}],"mockRequests":[]}*/
                    module.exports = function () {
                        var Bar = require('../page-objects/foo.po.js'), bar = new Bar();
                        this.When(/^something$/, function (done) {
                            var tasks = bar.baz(tag).then(function () {
                                return bar.bop();
                            });
                            Promise.resolve(tasks).then(done).catch(done.fail);
                        });
                    };
                `));
            })
            .finally(() => {
                StepDefinitionFile.prototype.save.restore();
            });
        });
    });
});
