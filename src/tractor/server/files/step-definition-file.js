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
        let references = this.fileStructure.references.getReferencesFrom(this.path);
        this.fileStructure.references.clearReferences(this.path);

        // Hack to fix coverage bug: https://github.com/gotwarlost/istanbul/issues/690
        /* istanbul ignore next */
        let move = super.move(update, options);

        return move.then(newFile => {
            return Promise.map(references, reference => {
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

        return read.then(() => getFileReferences.call(this))
        .then(() => checkIfPending.call(this))
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

        return save.then(() => getFileReferences.call(this))
        .then(() => checkIfPending.call(this))
        .then(() => this.content);
    }
}

StepDefinitionFile.prototype.extension = '.step.js';

function checkIfPending () {
    this.isPending = false;

    let pendingIdentifiers = esquery(this.ast, PENDING_QUERY);
    pendingIdentifiers.forEach(pendingIdentifier => {
        if (pendingIdentifier.value === PENDING_IDENTIFIER) {
            this.isPending = true;
        }
    });
}

function getFileReferences () {
    if (this.initialised) {
        this.fileStructure.references.clearReferences(this.path);
    }

    esquery(this.ast, REQUIRE_QUERY).forEach(requirePath => {
        let directoryPath = path.dirname(this.path);
        let referencePath = path.resolve(directoryPath, requirePath.value);
        let reference = this.fileStructure.references.getReference(referencePath);
        if (reference) {
            this.fileStructure.references.addReference(reference, this);
        }
    });

    this.initialised = true;
}
