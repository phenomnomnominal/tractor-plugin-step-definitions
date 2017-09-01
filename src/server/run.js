// Dependencies:
import { StepDefinitionFile } from './step-definition-file';

export default function run (
    mockRequestsFileStructure,
    pageObjectsFileStructure,
    stepDefinitionsFileStructure
) {
    return stepDefinitionsFileStructure.read()
    .then(() => {
        // StepDefinitionFile.addReferences(mockRequestsFileStructure);
        // StepDefinitionFile.addReferences(pageObjectsFileStructure);
    });
}
run['@Inject'] = ['mockRequestsFileStructure', 'pageObjectsFileStructure', 'stepDefinitionsFileStructure'];
