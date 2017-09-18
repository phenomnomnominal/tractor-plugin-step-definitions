// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import './page-object-instance';
import './mock-request-instance';

function createStepDefinitionModelConstructor (
    astCreatorService,
    PageObjectInstanceModel,
    MockRequestInstanceModel
) {
    let StepDefinitionModel = function StepDefinitionModel (options) {
        this.pageObjects = [];
        this.pageObjectInstances = [];

        this.mockRequests = [];
        this.mockRequestInstances = [];

        Object.defineProperties(this, {
            parameters: {
                get () {
                    return options.parameters
                }
            },
            availablePageObjects: {
                get () {
                    return options.availablePageObjects;
                }
            },
            availableMockRequests: {
                get () {
                    return options.availableMockRequests;
                }
            },
            url: {
                get () {
                    return options.url;
                }
            },
            meta: {
                get () {
                    return JSON.stringify({
                        name: this.name,
                        pageObjects: this.pageObjectInstances.map(pageObject => pageObject.meta),
                        mockRequests: this.mockRequestInstances.map(mockRequest => mockRequest.meta)
                    });
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            },
            data: {
                get () {
                    return this.ast;
                }
            }
        });
    };

    StepDefinitionModel.prototype.addPageObject = function (name) {
        let pageObject = this.availablePageObjects.find(pageObject => {
            return pageObject.name === name;
        });
        if (pageObject && !this.pageObjects.includes(pageObject)) {
            this.pageObjects.push(pageObject);
            this.pageObjectInstances.push(new PageObjectInstanceModel(pageObject, this));
        }
    };

    StepDefinitionModel.prototype.removePageObject = function (toRemove) {
        let index = this.pageObjectInstances.indexOf(toRemove);
        this.pageObjectInstances.splice(index, 1);
        this.pageObjects.splice(index, 1);
    };

    StepDefinitionModel.prototype.addMock = function (name) {
        let mockRequest = this.availableMockRequests.find(mockRequest => {
            return mockRequest.name === name;
        });
        if (mockRequest && !this.mockRequests.includes(mockRequest)) {
            this.mockRequests.push(mockRequest);
            this.mockRequestInstances.push(new MockRequestInstanceModel(mockRequest, this));
        }
    };

    StepDefinitionModel.prototype.removeMock = function (toRemove) {
        let index = this.mockRequestInstances.indexOf(toRemove);
        this.mockRequestInstances.splice(index, 1);
        this.mockRequests.splice(index, 1);
    };

    return StepDefinitionModel;

    function toAST () {
        let ast = astCreatorService;
        let pageObjects = this.pageObjectInstances.map(pageObject => pageObject.ast);
        let mockRequests = this.mockRequestInstances.map(mockRequest => mockRequest.ast);

        let template = 'module.exports = function () { ';
        if (pageObjects.length) {
            template += '%= pageObjects %; ';
        }
        if (mockRequests.length) {
            template += '%= mockRequests %; ';
        }
        template += '%= step %; ';
        template += '};';

        return ast.file(ast.expression(template, {
            pageObjects,
            mockRequests,
            step: this.step.ast
        }), this.meta);
    }
}

StepDefinitionsModule.factory('StepDefinitionModel', createStepDefinitionModelConstructor);
