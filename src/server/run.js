// Dependencies:
import Promise from 'bluebird';

export default function run (
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
    mockRequestsFileStructure.references.addFileStructure(stepDefinitionsFileStructure);
    return mockRequestsFileStructure.read();
}
addMockRequests['@Inject'] = ['mockRequestsFileStructure', 'stepDefinitionsFileStructure'];


function addPageObjects (
    pageObjectsFileStructure,
    stepDefinitionsFileStructure
) {
    pageObjectsFileStructure.references.addFileStructure(stepDefinitionsFileStructure);
    return pageObjectsFileStructure.read();
}
addPageObjects['@Inject'] = ['pageObjectsFileStructure', 'stepDefinitionsFileStructure'];
