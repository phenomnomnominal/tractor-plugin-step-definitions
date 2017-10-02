// Utilities:
import * as path from 'path';
import { camel, pascal } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createPageObjectInstanceModelConstructor (
    astCreatorService,
    config
) {
    let PageObjectInstanceModel = function PageObjectInstanceModel (meta, stepDefinition) {
        Object.defineProperties(this, {
            stepDefinition: {
                get () {
                    return stepDefinition;
                }
            },
            meta: {
                get () {
                    return meta;
                }
            },
            name: {
                get () {
                    return this.meta.name;
                }
            },
            constructorName: {
                get () {
                    return pascal(this.name);
                }
            },
            variableName: {
                get () {
                    return camel(this.name);
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });
    };

    return PageObjectInstanceModel;

    function toAST () {
        let ast = astCreatorService;

        let template = 'var <%= constructor %> = require(<%= path %>), ';
        template += '<%= name %> = new <%= constructor %>(); ';

        let relativePath = getRelativePath.call(this);

        return ast.template(template, {
            constructor: ast.identifier(this.constructorName),
            path: ast.literal(relativePath),
            name: ast.identifier(this.variableName)
        });
    }

    function getRelativePath () {
        let pageObjectPath = path.join(config.pageObjects.directory, this.pageObject.url);
        let stepDefinitionPath = path.join(config.stepDefinitions.directory, this.stepDefinition.url);
        return path.relative(path.dirname(stepDefinitionPath), pageObjectPath);
    }
}

StepDefinitionsModule.factory('PageObjectInstanceModel', createPageObjectInstanceModelConstructor);
