// Utilities:
import assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/header'

function HeaderParserService (
    HeaderModel
) {
    return { parse };

    function parse (mock, ast) {
        try {
            let header = new HeaderModel(mock);

            try {
                parseKey(header, ast);
                parseValue(header, ast);
                return header;
            // eslint-disable-next-line no-empty
            } catch (e) { }

            throw new Error();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Invalid header:', ast);
            return null;
        }
    }

    function parseKey (header, ast) {
        let key = ast.key.value;
        assert(key);
        header.key = key;
    }

    function parseValue (header, ast) {
        let value = ast.value.value;
        assert(value);
        header.value = value;
    }
}

StepDefinitionsModule.service('headerParserService', HeaderParserService);
