// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createParameterMetaModelConstructor () {
    return function ParameterMetaModel (parameter) {
        Object.defineProperties(this, {
            name: {
                get () {
                    return parameter.name;
                }
            }
        });
    }
}

StepDefinitionsModule.factory('ParameterMetaModel', createParameterMetaModelConstructor);
