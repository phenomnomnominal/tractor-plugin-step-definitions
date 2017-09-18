// Dependencies:
import path from 'path';
import { warn } from 'tractor-logger';
import { createDir } from 'tractor-file-structure';

// Errors:
import { TractorError } from 'tractor-error-handler';

export function init (config) {
    let stepDefinitionsDirectoryPath = path.resolve(process.cwd(), config.stepDefinitions.directory);

    return createDir(stepDefinitionsDirectoryPath)
    .catch(TractorError.isTractorError, error => warn(`${error.message} Moving on...`));
}
init['@Inject'] = ['config'];
