// Utilities:
import * as path from 'path';
import { camel, pascal } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createPageObjectInstanceModelConstructor (
    astCreatorService
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
            displayName: {
                get () {
                    return this.meta.displayName;
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
        return path.relative(path.dirname(this.stepDefinition.file.path), this.meta.path);
    }
}

StepDefinitionsModule.factory('PageObjectInstanceModel', createPageObjectInstanceModelConstructor);
