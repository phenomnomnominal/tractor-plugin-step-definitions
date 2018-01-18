/* global angular:true */

// Module:
import { StepDefinitionsModule } from './step-definitions.module';

// Dependencies:
import './parsers/step-definition-parser.service';
import './step-definitions/step-definitions.component';
import './step-definition-file-structure.service';

let tractor = angular.module('tractor');
tractor.requires.push(StepDefinitionsModule.name);

tractor.config((
    redirectionServiceProvider,
    $stateProvider
) => {
    redirectionServiceProvider.addFileType('.step.js', 'step-definitions');

    $stateProvider
    .state('tractor.step-definitions', {
        url: 'step-definitions{file:TractorFile}',
        component: 'tractorStepDefinitions',
        resolve: {
            availablePageObjects ($injector) {
                if (!$injector.has('pageObjectFileStructureService')) {
                    return [];
                }
                let pageObjectFileStructureService = $injector.get('pageObjectFileStructureService');
                let PageObjectMetaModel = $injector.get('PageObjectMetaModel');
                return pageObjectFileStructureService.getFileStructure()
                .then(() => pageObjectFileStructureService.fileStructure.allFiles.filter(file => {
                    return file.extension === '.po.js';
                })
                .map(file => new PageObjectMetaModel(file)));
            },
            availableMockRequests ($injector) {
                if (!$injector.has('mockRequestFileStructureService')) {
                    return [];
                }
                let mockRequestFileStructureService = $injector.get('mockRequestFileStructureService');
                let MockDataMetaModel = $injector.get('MockDataMetaModel');
                return mockRequestFileStructureService.getFileStructure()
                .then(() => mockRequestFileStructureService.fileStructure.allFiles.filter(file => {
                    return file.extension === '.mock.json';
                })
                .map(file => new MockDataMetaModel(file)));
            },
            stepDefinition (
                $stateParams,
                availablePageObjects,
                availableMockRequests,
                stepDefinitionFileStructureService,
                stepDefinitionParserService
            ) {
                let stepDefinitionUrl = $stateParams.file && $stateParams.file.url;
                if (!stepDefinitionUrl) {
                    return null;
                }
                return stepDefinitionFileStructureService.openItem(stepDefinitionUrl)
                .then(function (file) {
                    return stepDefinitionParserService.parse(file, availablePageObjects, availableMockRequests);
                });
            }
        }
    });
});
