/* global describe:true, it:true */

// Test setup:
import { expect } from '../../test-setup';

// Under test:
import { config } from './config';

describe('tractor-plugin-step-definitions - tractor/config:', () => {
    describe('config', () => {
        it('should create the config object', () => {
            let stepDefinitionsConfig = {};
            let tractorConfig = {
                stepDefinitions: stepDefinitionsConfig
            };

            let processed = config(tractorConfig);

            expect(processed).to.equal(stepDefinitionsConfig);
            expect(processed.directory).to.equal('./tractor/step-definitions');
        });

        it('should allow for a custom directory to be set', () => {
            let tractorConfig = {
                stepDefinitions: {
                    directory: './src'
                }
            };

            let processed = config(tractorConfig);

            expect(processed.directory).to.equal('./src');
        });
    });
});
