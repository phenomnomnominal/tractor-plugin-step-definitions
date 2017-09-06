// Constants:
const DEFAULT_DIRECTORY = './tractor/step-definitions';

export function getConfig (config) {
    config.stepDefinitions = config.stepDefinitions || {};
    let { stepDefinitions } = config;
    stepDefinitions.directory = stepDefinitions.directory || DEFAULT_DIRECTORY;
    return stepDefinitions;
}
