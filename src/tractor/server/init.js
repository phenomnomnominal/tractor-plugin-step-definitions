// Dependencies:
import { TractorError } from '@tractor/error-handler';
import { createDir } from '@tractor/file-structure';
import { warn } from '@tractor/logger';
import path from 'path';

export function init (config) {
    let stepDefinitionsDirectoryPath = path.resolve(process.cwd(), config.stepDefinitions.directory);

    return createDir(stepDefinitionsDirectoryPath)
    .catch(TractorError.isTractorError, error => warn(`${error.message} Moving on...`));
}
init['@Inject'] = ['config'];
