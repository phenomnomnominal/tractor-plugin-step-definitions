// Utilities:
import * as path from 'path';
import { camel } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createMockRequestInstanceModelConstructor (
    astCreatorService,
    config
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
        let mockRequestsPath = path.join(config.mockRequests.directory, this.mockRequest.url);
        let stepDefinitionPath = path.join(config.stepDefinitions.directory, this.stepDefinition.url);
        return path.relative(path.dirname(stepDefinitionPath), mockRequestsPath);
    }
}

StepDefinitionsModule.factory('MockRequestInstanceModel', createMockRequestInstanceModelConstructor);
