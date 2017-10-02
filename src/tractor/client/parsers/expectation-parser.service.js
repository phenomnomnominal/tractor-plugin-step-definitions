// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/expectation';

function ExpectationParserService (
    ExpectationModel
) {
    return { parse };

    function parse (step, ast) {
        try {
            let expectation = new ExpectationModel(step);
            let [argument] = ast.arguments;
            expectation.value = argument.raw;

            let [expectationCallExpression] = ast.callee.object.object.object.arguments;

            expectation.pageObject = parsePageObject(expectation, expectationCallExpression);
            expectation.action = parseAction(expectation, expectationCallExpression);
            expectation.condition = ast.callee.property.name;
            parseArguments(expectation, expectationCallExpression);

            return expectation;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Invalid expectation:', ast);
            return null;
        }
    }

    function parsePageObject (expectation, expectationCallExpression) {
        return expectation.step.stepDefinition.pageObjectInstances.find(pageObjectInstance => {
            return expectationCallExpression.callee.object.name === pageObjectInstance.variableName;
        });
    }

    function parseAction (expectation, expectationCallExpression) {
        return expectation.pageObject.meta.actions.find(action => {
            return expectationCallExpression.callee.property.name === action.variableName;
        });
    }

    function parseArguments (expectation, expectationCallExpression) {
        expectationCallExpression.arguments.forEach((argument, index) => {
            expectation.arguments[index].value = argument.value;
        });
    }
}

StepDefinitionsModule.service('expectationParserService', ExpectationParserService);
