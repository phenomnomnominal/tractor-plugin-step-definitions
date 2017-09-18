// Module:
import { StepDefinitionsModule } from './step-definitions.module';

StepDefinitionsModule.factory('stepDefinitionFileStructureService', fileStructureServiceFactory => {
    return fileStructureServiceFactory('step-definitions');
});
