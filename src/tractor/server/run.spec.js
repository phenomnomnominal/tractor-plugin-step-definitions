/* global describe:true, it:true */

// Test setup:
import { expect, ineeda, NOOP } from '../../../test-setup';

// Under test:
import { run } from './run';

describe('tractor-plugin-step-definitions - run:', () => {
    it('should read the FileStructure', () => {
        let di = ineeda();
        let stepDefinitionsFileStructure = ineeda({
            read: NOOP
        });

        return run(di, stepDefinitionsFileStructure)
        .then(() => {
            expect(stepDefinitionsFileStructure.read).to.have.been.called();
        });
    });
});
