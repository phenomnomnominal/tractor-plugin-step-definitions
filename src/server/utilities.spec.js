/* global describe:true, it:true */

// Test setup:
import { expect } from '../../test-setup';

// Under test:
import { getConfig } from './utilities';

describe('tractor-plugin-step-definitions - utilities:', () => {
    describe('getConfig', () => {
        it('should create the config object', () => {
            let stepDefinitionsConfig = {};
            let tractorConfig = {
                stepDefinitions: stepDefinitionsConfig
            };

            let config = getConfig(tractorConfig);

            expect(config).to.equal(stepDefinitionsConfig);
            expect(config.directory).to.equal('./tractor/step-definitions');
        });

        it('should allow for a custom directory to be set', () => {
            let tractorConfig = {
                stepDefinitions: {
                    directory: './src'
                }
            };

            let config = getConfig(tractorConfig);

            expect(config.directory).to.equal('./src');
        });
    });
});
