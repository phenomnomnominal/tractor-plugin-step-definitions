// Utilities:
import * as assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/step';
import './expectation-parser.service';
import './mock-parser.service';
import './task-parser.service';

function StepParserService (
    StepModel,
    expectationParserService,
    mockParserService,
    taskParserService
) {
    return { parse };

    function parse (stepDefinition, ast) {
        try {
            let step = new StepModel(stepDefinition);

            let stepCallExpression = ast.expression;
            step.type = parseType(step, stepCallExpression);
            step.regex = parseRegex(step, stepCallExpression);

            let stepFunction = ast.expression.arguments[ast.expression.arguments.length - 1];
            let statements = stepFunction.body.body;
            tryParse(step, statements, [parseMock, parseTask, parseExpectation, parsePending, parseMockDone, parseTaskDone]);

            return step;
        } catch (e) {
            console.warn('Invalid step:', ast);
            return null;
        }
    }

    function parseType (step, stepCallExpression) {
        let type = stepCallExpression.callee.property.name;
        assert(step.stepTypes.includes(type));
        return type;
    }

    function parseRegex (step, stepCallExpression) {
        let [stepRegexArgument] = stepCallExpression.arguments;
        let regex = stepRegexArgument.raw.replace(/^\//, '').replace(/\/$/, '');
        assert(regex);
        return new RegExp(regex);
    }

    function tryParse (step, statements, parsers) {
        statements.map(statement => {
            let parsed = parsers.some(parser => {
                try {
                    return parser(step, statement);
                } catch (e) { }
            });
            if (!parsed) {
                throw new Error();
            }
        });
    }

    function parseMock (step, statement) {
        let [firstArgument] = statement.expression.callee.object.callee.object.arguments
        firstArgument.elements.forEach(element => {
            assert(element.callee.object.name === 'mockRequests');
            assert(element.callee.property.name.indexOf('when') === 0);
            let mock = mockParserService.parse(step, element);
            assert(mock);
            step.mocks.push(mock);
        });
        return true;
    }

    function parseTask (step, statement) {
        let [tasksDeclaration] = statement.declarations;
        assert(tasksDeclaration.id.name === 'tasks');
        taskParserService.parse(step, tasksDeclaration.init);
        return true;
    }

    function parseExpectation (step, statement) {
        let [firstArgument] = statement.expression.callee.object.callee.object.arguments;
        let elements = firstArgument.elements;
        firstArgument.elements.forEach(element => {
            assert(!(element.name && element.name === 'tasks'));
            let expectation = expectationParserService.parse(step, element);
            assert(expectation);
            step.expectations.push(expectation);
        });
        return true;
    }

    function parsePending (step, statement) {
        let { callee } = statement.expression;
        assert(callee.name === 'callback' || callee.name === 'done');
        assert(statement.expression.arguments[1].value === 'pending');
        return true;
    }

    function parseMockDone (step, statement) {
        assert(statement.expression.callee.name === 'done');
        return true;
    }

    function parseTaskDone (step, statement) {
        assert(statement.expression.callee.object.arguments[0].name === 'done');
        return true;
    }
}

StepDefinitionsModule.service('stepParserService', StepParserService);
