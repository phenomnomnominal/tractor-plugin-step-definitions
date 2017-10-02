// Constants:
const PENDING_IDENTIFIER = 'pending';
const PENDING_QUERY = 'CallExpression[callee.name="callback"] .arguments[value]';
const REQUIRE_QUERY = 'CallExpression[callee.name="require"] Literal';

// Dependencies:
import Promise from 'bluebird';
import path from 'path';
import esquery from 'esquery';
import { JavaScriptFile } from 'tractor-file-javascript';
import { StepDefinitionFileRefactorer } from './step-definition-file-refactorer';

export class StepDefinitionFile extends JavaScriptFile {
    move (update, options) {
        let { referencedBy } = this;
        this.clearReferences();

        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let move = super.move(update, options);

        return move.then(newFile => {
            return Promise.map(referencedBy, reference => {
                return newFile.refactor('referencePathChange', {
                    oldFromPath: this.path,
                    newFromPath: newFile.path,
                    toPath: reference.path
                });
            });
        });
    }

    read () {
        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let read = super.read();

        return read.then(() => getReferences.call(this))
        .then(() => this.content);
    }

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

    save (data) {
        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let save = super.save(data);

        return save.then(() => getReferences.call(this))
        .then(() => this.content);
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

function getReferences () {
    if (this.initialised) {
        this.clearReferences();
    }

    esquery(this.ast, REQUIRE_QUERY).forEach(requirePath => {
        let directoryPath = path.dirname(this.path);
        let referencePath = path.resolve(directoryPath, requirePath.value);
        let reference = this.fileStructure.referenceManager.getReference(referencePath);
        if (reference) {
            this.addReference(reference);
        }
    });

    this.initialised = true;
}
