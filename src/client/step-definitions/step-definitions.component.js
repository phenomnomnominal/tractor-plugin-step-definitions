// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Template:
import template from './step-definitions.component.html';

// Styles:
import style from './step-definitions.component.css';

function StepDefinitionsController (
    $sce,
    $scope,
    $state,
    $window,
    confirmDialogService,
    fileEditorControllerFactory,
    stepDefinitionFileStructureService,
    persistentStateService,
    notifierService
) {
    let { availablePageObjects, availableMockRequests, stepDefinition } = $scope.$parent.$resolve;
    var controller = fileEditorControllerFactory(
        $scope,
        $window,
        $state,
        confirmDialogService,
        stepDefinitionFileStructureService,
        persistentStateService,
        notifierService,
        null,
        stepDefinition,
        'step-definitions',
        '.step.js'
    );

    Object.defineProperties(controller, {
        canAddPageObjects: {
            get: function () {
                return availablePageObjects.length > 0
                    && this.fileModel.step.type !== 'Given';
            }
        },
        canAddMockRequests: {
            get: function () {
                return availableMockRequests.length > 0
                    && this.fileModel.step.type === 'Given';
            }
        },
        hasPageObjects: {
            get: function () {
                return this.fileModel
                    && this.fileModel.pageObjectInstances
                    && this.fileModel.pageObjectInstances.length > 0;
            }
        },
        hasMockRequests: {
            get: function () {
                return this.fileModel
                    && this.fileModel.mockRequestInstances
                    && this.fileModel.mockRequestInstances.length > 0;
            }
        },
        showTasksSection: {
            get: function () {
                return this.hasPageObjects
                    && this.fileModel.step.type === 'When';
            }
        },
        showExpectationsSection: {
            get: function () {
                return this.hasPageObjects
                    && this.fileModel.step.type === 'Then';
            }
        },
        showMockRequestsSection: {
            get: function () {
                return this.fileModel.step.type === 'Given';
            }
        }
    });

    controller.style = $sce.trustAsHtml(style.toString());
    return controller;
}

StepDefinitionsModule.component('tractorStepDefinitions', {
    controller: StepDefinitionsController,
    template
});
