// Utilities:
import * as path from 'path';
import { pascal } from 'change-case';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Depenedencies:
import './action-meta';

function createPageObjectMetaModelConstructor (
    ActionMetaModel
) {
    return function PageObjectMetaModel (pageObject) {
        let actions = pageObject.meta.actions.map(action => new ActionMetaModel(action));

        Object.defineProperties(this, {
            actions: {
                get () {
                    return actions;
                }
            },
            name: {
                get () {
                    return pageObject.meta.name;
                }
            },
            variableName: {
                get () {
                    return pascal(this.name);
                }
            },
            url: {
                get () {
                    return pageObject.url;
                }
            }
        });
    }
};

StepDefinitionsModule.factory('PageObjectMetaModel', createPageObjectMetaModelConstructor);
