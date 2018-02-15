// Dependencies:
import Promise from 'bluebird';

export function run (
    di,
    stepDefinitionsFileStructure
) {
    let readMockRequests;
    try {
        readMockRequests = di.call(addMockRequests);
    } catch (e) {
        readMockRequests = Promise.resolve();
    }

    let readPageObjects;
    try {
        readPageObjects = di.call(addPageObjects)
    } catch (e) {
        readPageObjects = Promise.resolve();
    }

    return Promise.all([readMockRequests, readPageObjects])
    .then(() => stepDefinitionsFileStructure.read());
}
run['@Inject'] = ['di', 'stepDefinitionsFileStructure'];

function addMockRequests (
    mockRequestsFileStructure,
    stepDefinitionsFileStructure
) {
    mockRequestsFileStructure.referenceManager.addFileStructure(stepDefinitionsFileStructure);
    return mockRequestsFileStructure.read();
}
addMockRequests['@Inject'] = ['mockRequestsFileStructure', 'stepDefinitionsFileStructure'];

function addPageObjects (
    pageObjectsFileStructure,
    includeFileStructures,
    stepDefinitionsFileStructure
) {
    pageObjectsFileStructure.referenceManager.addFileStructure(stepDefinitionsFileStructure);
    includeFileStructures.forEach(fileStructure => fileStructure.referenceManager.addFileStructure(stepDefinitionsFileStructure));
    return pageObjectsFileStructure.read();
}
addPageObjects['@Inject'] = ['pageObjectsFileStructure', 'includeFileStructures', 'stepDefinitionsFileStructure'];
