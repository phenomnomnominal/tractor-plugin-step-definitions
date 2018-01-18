// Utilities:
import assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/step-definition';
import '../models/step-definition-parameter';
import './step-parser.service';

// Constants:
const PARAMETER_NAME_REGEX = /([a-zA-Z]*)="([^"]*)"/g;

function StepDefinitionParserService (
    StepDefinitionParameterModel,
    StepDefinitionModel,
    stepParserService
) {
    return { parse };

    function parse (stepDefinitionFile, availablePageObjects, availableMockRequests) {
        let parameters = getParameters(stepDefinitionFile);
        try {
            let { ast } = stepDefinitionFile;
            let [firstComment] = ast.comments;
            let meta = JSON.parse(firstComment.value);

            let stepDefinition = new StepDefinitionModel({
                parameters,
                availablePageObjects,
                availableMockRequests,
                file: stepDefinitionFile
            });
            stepDefinition.name = meta.name;

            let [module] = ast.body;
            let statements = module.expression.right.body.body;

            tryParse(stepDefinition, statements, meta, [parsePageObject, parseMock, parseStep]);

            return stepDefinition;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Invalid step definition:', stepDefinitionFile.ast);
            return null;
        }
    }

    function getParameters (stepDefinitionFile) {
        let parameters = stepDefinitionFile.meta.name.match(PARAMETER_NAME_REGEX) || [];
        return parameters.map(parameter => new StepDefinitionParameterModel(parameter));
    }

    function tryParse (stepDefinition, statements, meta, parsers) {
        statements.map(statement => {
            let parsed = parsers.some(parser => {
                try {
                    return parser(stepDefinition, statement, meta);
                // eslint-disable-next-line no-empty
                } catch (e) { }
            });
            if (!parsed) {
                throw new Error();
            }
        });
    }

    function parsePageObject (stepDefinition, statement, meta) {
        let declarator = statement.declarations[statement.declarations.length - 1];
        let { name } = declarator.init.callee;
        assert(name !== 'require');
        stepDefinition.addPageObject(meta.pageObjects[stepDefinition.pageObjects.length].name);
        return true;
    }

    function parseMock (stepDefinition, statement, meta) {
        let [declarator] = statement.declarations;
        let { name } = declarator.init.callee;
        assert(name === 'require');
        let [path] = declarator.init.arguments;
        assert(path.value.match(/\.mock.json$/));
        stepDefinition.addMock(meta.mockRequests[stepDefinition.mockRequests.length].name);
        return true;
    }

    function parseStep (stepDefinition, statement) {
        let step = stepParserService.parse(stepDefinition, statement);
        assert(step);
        stepDefinition.step = step;
        return true;
    }
}

StepDefinitionsModule.service('stepDefinitionParserService', StepDefinitionParserService);
