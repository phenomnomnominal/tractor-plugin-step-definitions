// Constants:
const DEFAULT_DIRECTORY = './tractor/step-definitions';

export function config (tractorConfig) {
    tractorConfig.stepDefinitions = tractorConfig.stepDefinitions || {};
    let { stepDefinitions } = tractorConfig;
    stepDefinitions.directory = stepDefinitions.directory || DEFAULT_DIRECTORY;
    return stepDefinitions;
}
