// Utilities:
import assert from 'assert';

// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import '../models/task';

function TaskParserService (
    TaskModel
) {
    return { parse };

    function parse (step, ast) {
        try {
            parseNextTask(step, ast);

            let parsers = [parseFirstTask, parseSubsequentTask];
            let taskCallExpression = parseTaskCallExpression(ast, parsers);

            try {
                return parseTask(step, taskCallExpression);
            // eslint-disable-next-line no-empty
            } catch (e) { }

            throw new Error();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Invalid task:', ast);
            return null;
        }
    }

    function parseNextTask (step, ast) {
        try {
            assert(ast.callee.object.callee);
            parse(step, ast.callee.object);
        // eslint-disable-next-line no-empty
        } catch (e) { }
    }

    function parseTaskCallExpression (ast, parsers) {
        let taskCallExpression = null;
        parsers.filter(parser => {
            try {
                taskCallExpression = parser(ast);
            // eslint-disable-next-line no-empty
            } catch (e) { }
        });
        if (!taskCallExpression) {
            throw new Error();
        }
        return taskCallExpression;
    }

    function parseFirstTask (ast) {
        assert(ast.callee.object.name && ast.callee.property.name);
        return ast;
    }

    function parseSubsequentTask (ast) {
        let [thenFunctionExpression] = ast.arguments;
        let [taskReturnStatement] = thenFunctionExpression.body.body;
        return taskReturnStatement.argument;
    }

    function parseTask (step, taskCallExpression) {
        let task = new TaskModel(step);
        task.pageObject = task.step.stepDefinition.pageObjectInstances.find(pageObjectInstance => {
            return taskCallExpression.callee.object.name === pageObjectInstance.variableName;
        });
        task.action = task.pageObject.meta.actions.find(action => {
            return taskCallExpression.callee.property.name === action.variableName;
        });
        taskCallExpression.arguments.forEach((argument, index) => {
            let value;
            if (argument.type === 'Identifier') {
                value = argument.name;
            }
            if (argument.type === 'Literal') {
                value = argument.value;
            }
            task.arguments[index].value = value;
        });
        task.step.tasks.push(task);
        return true;
    }
}

StepDefinitionsModule.service('taskParserService', TaskParserService);
