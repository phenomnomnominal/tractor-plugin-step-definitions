// Utilities:
import { pascal } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createMockRequestMetaModelConstructor () {
    let MockRequestMetaModel = function MockRequestMetaModel (mockRequest) {
        Object.defineProperties(this, {
            name: {
                get () {
                    return mockRequest.basename;
                }
            },
            variableName: {
                get () {
                    return pascal(this.name);
                }
            },
            url: {
                get () {
                    return mockRequest.url;
                }
            },
            comment: {
                get () {
                    return toComment.call(this);
                }
            }
        });
    }

    MockRequestMetaModel.prototype.actions = ['GET', 'POST', 'DELETE', 'PUT', 'HEAD', 'PATCH'];

    return MockRequestMetaModel;

    function toComment () {
        return {
            name: this.name
        };
    }
}

StepDefinitionsModule.factory('MockRequestMetaModel', createMockRequestMetaModelConstructor);
