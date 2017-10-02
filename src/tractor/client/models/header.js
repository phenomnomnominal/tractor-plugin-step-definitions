// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createHeaderModelConstructor () {
    return function HeaderModel (mock) {
        Object.defineProperties(this, {
            mock: {
                get () {
                    return mock;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });

        this.key = '';
        this.value = '';
    }

    function toAST () {
        return '"' + this.key.replace(/"/, '\\"') + '": ' + '"' + this.value.replace(/"/, '\\"') + '"'
    }
}

StepDefinitionsModule.factory('HeaderModel', createHeaderModelConstructor);
