// Utilities:
import path from 'path';
import { getConfig } from './utilities';

// Dependencies:
import { FileStructure, serveFileStructure } from 'tractor-file-structure';
import { StepDefinitionFile } from './files/step-definition-file';

export default function serve (config, di) {
    config = getConfig(config);

    let { directory } = config;

    let stepDefinitions = path.resolve(process.cwd(), directory);
    let stepDefinitionsFileStructure = new FileStructure(stepDefinitions);
    di.constant({ stepDefinitionsFileStructure });
    stepDefinitionsFileStructure.addFileType(StepDefinitionFile);

    di.call(serveFileStructure)(stepDefinitionsFileStructure, 'step-definitions');
}
serve['@Inject'] = ['config', 'di'];
