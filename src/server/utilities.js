// Constants:
const DEFAULT_DIRECTORY = './tractor/step-definitions';

export function getConfig (config) {
    config = config.stepDefinitions || {};
    config.directory = config.directory || DEFAULT_DIRECTORY;
    return config;
}
