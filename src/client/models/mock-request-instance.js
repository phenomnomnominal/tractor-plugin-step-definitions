// Utilities:
import * as path from 'path';
import { camel } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createMockRequestInstanceModelConstructor (
    astCreatorService
) {
    let MockRequestInstanceModel = function MockRequestInstanceModel (mockRequest, stepDefinition) {
        Object.defineProperties(this, {
            stepDefinition: {
                get () {
                    return stepDefinition;
                }
            },
            mockRequest: {
                get () {
                    return mockRequest;
                }
            },
            name: {
                get () {
                    return this.mockRequest.name;
                }
            },
            variableName: {
                get () {
                    return camel(this.name);
                }
            },
            meta: {
                get () {
                    return {
                        name: this.name
                    };
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });
    };

    return MockRequestInstanceModel;

    function toAST () {
        let ast = astCreatorService;
        let template = 'var <%= name %> = require(<%= path %>); ';
        let relativePath = getRelativePath.call(this);

        return ast.template(template, {
            name: ast.identifier(this.variableName),
            path: ast.literal(relativePath)
        });
    }

    function getRelativePath () {
        let relativePath = path.relative(path.dirname(this.stepDefinition.url), this.mockRequest.url);
        return relativePath;
    }
}

StepDefinitionsModule.factory('MockRequestInstanceModel', createMockRequestInstanceModelConstructor);
