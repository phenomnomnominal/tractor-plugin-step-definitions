// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Constants:
const PARAMETER_NAME_REGEX = /([a-zA-Z]*)="([^"]*)"/;

function createParameterModelConstructor (
    astCreatorService
) {
    return function StepDefinitionParameterModel (parameter) {
        let [, variableName] = parameter.match(PARAMETER_NAME_REGEX);

        Object.defineProperties(this, {
            variableName: {
                get () {
                    return variableName;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });

        function toAST () {
            return astCreatorService.identifier(this.variableName);
        }
    }
}

StepDefinitionsModule.factory('StepDefinitionParameterModel', createParameterModelConstructor);
