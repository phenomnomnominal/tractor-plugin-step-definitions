/* global describe:true, it:true */

// Test setup:
import { expect, ineeda, NOOP, sinon } from '@tractor/unit-test';

// Dependencies:
import { FileStructure } from '@tractor/file-structure';
import { StepDefinitionFile } from './files/step-definition-file';

// Under test:
import { serve } from './serve';

describe('tractor-plugin-features - serve:', () => {
    it('should create a new FileStructure', () => {
        let stepDefinitionsFileStructure = null;
        let config = {
            stepDefinitions: {
                directory: './tractor/step-definitions'
            }
        };
        let di = ineeda({
            call: () => NOOP,
            constant: constants => {
                stepDefinitionsFileStructure = constants.stepDefinitionsFileStructure;
            }
        });

        serve(config, di);

        expect(stepDefinitionsFileStructure).to.be.an.instanceof(FileStructure);
    });

    it('should add the FileStructure to the DI container', () => {
        let config = {
            stepDefinitions: {
                directory: './tractor/step-definitions'
            }
        };
        let di = ineeda({
            call: () => NOOP,
            constant: NOOP
        });

        serve(config, di);

        expect(di.constant).to.have.been.called();
    });

    it('should add the StepDefinitionFile type to the FileStructure', () => {
        let config = {
            stepDefinitions: {
                directory: './tractor/step-definitions'
            }
        };
        let di = ineeda({
            call: () => NOOP,
            constant: NOOP
        });

        sinon.stub(FileStructure.prototype, 'addFileType');

        serve(config, di);

        expect(FileStructure.prototype.addFileType).to.have.been.calledWith(StepDefinitionFile);
    });
});
