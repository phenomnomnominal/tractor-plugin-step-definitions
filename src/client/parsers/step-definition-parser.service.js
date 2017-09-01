// Utilities:
import * as assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/mock-request-meta';
import '../models/page-object-meta';
import '../models/step-definition';
import './step-parser.service';

function StepDefinitionParserService (
    PageObjectMetaModel,
    MockRequestMetaModel,
    StepDefinitionModel,
    stepParserService
) {
    return { parse };

    function parse (stepDefinitionFile, availablePageObjects, availableMockRequests) {
        availablePageObjects = availablePageObjects.map(pageObject => new PageObjectMetaModel(pageObject));
        availableMockRequests = availableMockRequests.map(mockRequest => new MockRequestMetaModel(mockRequest));
        try {
            let { ast, url } = stepDefinitionFile;
            let [firstComment] = ast.comments;
            let meta = JSON.parse(firstComment.value);

            let stepDefinition = new StepDefinitionModel({ availablePageObjects, availableMockRequests, url });
            stepDefinition.name = meta.name;

            let [module] = ast.body;
            let statements = module.expression.right.body.body;

            tryParse(stepDefinition, statements, meta, [parsePageObject, parseMock, parseStep]);

            return stepDefinition;
        } catch (e) {
            console.warn('Invalid step definition:', stepDefinitionFile.ast);
            return null;
        }
    }

    function tryParse (stepDefinition, statements, meta, parsers) {
        statements.map(statement => {
            let parsed = parsers.some(parser => {
                try {
                    return parser(stepDefinition, statement, meta);
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
        stepDefinition.addMock(meta.mockRequest[stepDefinition.mockRequest.length].name);
        return true;
    }

    function parseStep (stepDefinition, statement) {
        let step = stepParserService.parse(stepDefinition, statement);
        assert(step);
        stepDefinition.step = step;
        return true;
    }
};

StepDefinitionsModule.service('stepDefinitionParserService', StepDefinitionParserService);
