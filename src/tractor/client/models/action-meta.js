// Utilities:
import { camel } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Depenedencies:
import './parameter-meta';

function createActionMetaModelConstructor (
    ParameterMetaModel
) {
    let ActionMetaModel = function ActionMetaModel (action) {
        let parameters = action.parameters.map(parameter => new ParameterMetaModel(parameter));

        Object.defineProperties(this, {
            name: {
                get () {
                    return action.name;
                }
            },
            variableName: {
                get () {
                    return camel(this.name);
                }
            },
            parameters: {
                get () {
                    return parameters;
                }
            }
        });
    };

    return ActionMetaModel;
}

StepDefinitionsModule.factory('ActionMetaModel', createActionMetaModelConstructor);
