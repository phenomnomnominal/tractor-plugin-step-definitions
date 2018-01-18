// Constants:
const PAGE_OBJECT_CLASS_CONSTRUCTOR_DECLARATOR_QUERY = 'VariableDeclarator[init.callee.name="require"]';
const PAGE_OBJECT_CLASS_CONSTRUCTOR_NEW_QUERY = 'NewExpression';
const PAGE_OBJECT_INSTANCE_ACTION_CALL_QUERY = 'CallExpression MemberExpression';
const PAGE_OBJECT_INSTANCE_DECLARATOR_QUERY = 'VariableDeclarator';
const MOCK_REQUEST_INSTANCE_REQUIRE_QUERY = 'VariableDeclarator[init.callee.name="require"]';
const MOCK_REQUEST_INSTANCE_BODY_PROPERTY_QUERY = 'ObjectExpression > Property[key.name=body]'

// Dependencies:
import Promise from 'bluebird';
import camelcase from 'camel-case';
import pascalcase from 'pascal-case';

export const StepDefinitionFileRefactorer = {
    referenceNameChange
};

function referenceNameChange (file, data) {
    let { extension } = data;

    if (extension === '.mock.json') {
        return mockRequestFileNameChange(file, data);
    }
    if (extension === '.po.js') {
        return pageObjectFileNameChange(file, data);
    }
    return Promise.resolve();
}

function mockRequestFileNameChange (file, data) {
    let { oldName, newName } = data;

    let oldInstanceName = camelcase(oldName);
    let newInstanceName = camelcase(newName);

    return file.refactor('metadataChange', {
        oldName,
        newName,
        type: 'mockRequests'
    })
    .then(file.refactor('identifierChange', {
        oldName: oldInstanceName,
        newName: newInstanceName,
        context: MOCK_REQUEST_INSTANCE_REQUIRE_QUERY
    }))
    .then(() => file.refactor('identifierChange', {
        oldName: oldInstanceName,
        newName: newInstanceName,
        context: MOCK_REQUEST_INSTANCE_BODY_PROPERTY_QUERY
    }));
}

function pageObjectFileNameChange (file, data) {
    let { oldName, newName } = data;

    let oldClassName = pascalcase(oldName);
    let newClassName = pascalcase(newName);
    let oldInstanceName = camelcase(oldName);
    let newInstanceName = camelcase(newName);

    return file.refactor('metadataChange', {
        oldName,
        newName,
        type: 'pageObjects'
    })
    .then(() => file.refactor('identifierChange', {
        oldName: oldClassName,
        newName: newClassName,
        context: PAGE_OBJECT_CLASS_CONSTRUCTOR_DECLARATOR_QUERY
    }))
    .then(() => file.refactor('identifierChange', {
        oldName: oldClassName,
        newName: newClassName,
        context: PAGE_OBJECT_CLASS_CONSTRUCTOR_NEW_QUERY
    }))
    .then(() => file.refactor('identifierChange', {
        oldName: oldInstanceName,
        newName: newInstanceName,
        context: PAGE_OBJECT_INSTANCE_ACTION_CALL_QUERY
    }))
    .then(() => file.refactor('identifierChange', {
        oldName: oldInstanceName,
        newName: newInstanceName,
        context: PAGE_OBJECT_INSTANCE_DECLARATOR_QUERY
    }));
}
