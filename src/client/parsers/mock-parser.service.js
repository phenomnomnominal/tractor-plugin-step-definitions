// Utilities:
import * as assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/mock-request';
import './header-parser.service';

function MockParserService (
    headerParserService,
    MockRequestModel
) {
    return { parse };

    function parse (step, ast) {
        try {
            let mock = new MockRequestModel(step);

            let mockCallExpression = ast.expression;

            mock.action = parseAction(mock, ast);
            mock.url = parseUrl(ast);

            try {
                parsePassThrough(mock, ast);
                return mock;
            } catch (e) { }

            try {
                parseData(mock, ast);
                parseStatus(mock, ast);
                parseHeaders(mock, ast);
                return mock;
            } catch (e) { }

            throw new Error();
        } catch (e) {
            console.warn('Invalid mock:', ast);
            return null;
        }
    }

    function parseAction (mock, ast) {
        let action = ast.callee.property.name.replace(/^when/, '');
        assert(action);
        assert(mock.actions.includes(action));
        return action;
    }

    /* The returned url should be the inner contents of the RegExp,
       with all escape sequences removed, so we strip out leading and
       trailing/characters, and any occurences of //. */
    function parseUrl (ast) {
        let [firstAgument] = ast.arguments;
        let rawUrl = firstAgument.raw;
        let url = rawUrl.replace(/^\//, '').replace(/\/$/, '').replace(/\\/g,'');
        assert(url);
        return url;
    }

    function parseData (mock, ast) {
        let options = ast.arguments[ast.arguments.length - 1];
        let bodyOption = findOption(options, 'body');
        assert(bodyOption);
        let instanceName = bodyOption.value.name;
        let data = mock.step.stepDefinition.mockRequestInstances.find(mockRequest => {
            return mockRequest.variableName === instanceName;
        });
        assert(data);
        mock.data = data;
    }

    function parsePassThrough (mock, ast) {
        let options = ast.arguments[ast.arguments.length - 1];
        let passThroughOption = findOption(options, 'passThrough');
        assert(passThroughOption);
        let passThrough = passThroughOption.value.value;
        mock.passThrough = !!passThrough;
    }

    function parseStatus (mock, ast) {
        let options = ast.arguments[ast.arguments.length - 1];
        let statusOption = findOption(options, 'status');
        if (statusOption) {
            let status = statusOption.value.value;
            mock.status = status;
        }
    }

    function parseHeaders (mock, ast) {
        let options = ast.arguments[ast.arguments.length - 1];
        let headersOption = findOption(options, 'headers');
        if (headersOption) {
            headersOption.value.properties.forEach(property => {
                let header = headerParserService.parse(mock, property);
                assert(header);
                mock.headers.push(header);
            });
        }
    }

    function findOption (options, key) {
        return options.properties.find(property => property.key.name === key);
    }
}

StepDefinitionsModule.service('mockParserService', MockParserService);
