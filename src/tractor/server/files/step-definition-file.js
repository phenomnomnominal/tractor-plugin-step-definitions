// Constants:
const PENDING_IDENTIFIER = 'pending';
const PENDING_QUERY = 'CallExpression[callee.name="callback"] .arguments[value]';

// Dependencies:
import Promise from 'bluebird';
import esquery from 'esquery';
import { JavaScriptFile } from 'tractor-file-javascript';
import { StepDefinitionFileRefactorer } from './step-definition-file-refactorer';

export class StepDefinitionFile extends JavaScriptFile {
    refactor (type, data) {
        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let refactor = super.refactor(type, data);

        return refactor.then(() => {
            let change = StepDefinitionFileRefactorer[type];
            return change ? change(this, data) : Promise.resolve();
        })
        .then(() => this.save(this.ast));
    }

    serialise () {
        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let serialised = super.serialise();

        serialised.pending = checkPending.call(this);
        return serialised;
    }
}

StepDefinitionFile.prototype.extension = '.step.js';

function checkPending () {
    let pendingIdentifiers = esquery(this.ast, PENDING_QUERY);
    return pendingIdentifiers.some(pendingIdentifier => {
        return pendingIdentifier.value === PENDING_IDENTIFIER;
    });
}
