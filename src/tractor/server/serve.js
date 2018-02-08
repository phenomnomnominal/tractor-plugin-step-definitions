// Dependencies:
import { FileStructure, serveFileStructure } from '@tractor/file-structure';
import path from 'path';
import { StepDefinitionFile } from './files/step-definition-file';

export function serve (config, di) {
    let stepDefinitionsDirectoryPath = path.resolve(process.cwd(), config.stepDefinitions.directory);

    let stepDefinitionsFileStructure = new FileStructure(stepDefinitionsDirectoryPath);
    stepDefinitionsFileStructure.addFileType(StepDefinitionFile);

    di.constant({ stepDefinitionsFileStructure });
    di.call(serveFileStructure)(stepDefinitionsFileStructure, 'step-definitions');
}
serve['@Inject'] = ['config', 'di'];
