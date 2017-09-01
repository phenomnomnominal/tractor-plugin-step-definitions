// Utilities:
import * as path from 'path';
import { camel, pascal } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createPageObjectInstanceModelConstructor (
    astCreatorService
) {
    let PageObjectInstanceModel = function PageObjectInstanceModel (pageObject, stepDefinition) {
        Object.defineProperties(this, {
            stepDefinition: {
                get () {
                    return stepDefinition;
                }
            },
            pageObject: {
                get () {
                    return pageObject;
                }
            },
            name: {
                get () {
                    return this.pageObject.name;
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
            actions: {
                get () {
                    return actions;
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
        return path.relative(path.dirname(this.stepDefinition.url), this.pageObject.url);
    }
}

StepDefinitionsModule.factory('PageObjectInstanceModel', createPageObjectInstanceModelConstructor);
