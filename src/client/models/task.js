// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import './argument';

function createTaskModelConstructor (
    astCreatorService,
    ArgumentModel
) {
    let TaskModel = function TaskModel (step) {
        let pageObject;
        let action;
        let args;

        Object.defineProperties(this, {
            step: {
                get () {
                    return step;
                }
            },
            pageObject: {
                get () {
                    return pageObject;
                },
                set (newPageObject) {
                    pageObject = newPageObject;
                    [this.action] = this.pageObject.pageObject.actions;
                }
            },
            action: {
                get () {
                    return action;
                },
                set (newAction) {
                    action = newAction;
                    args = parseArguments.call(this);
                }
            },
            arguments: {
                get () {
                    return args;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });

        [this.pageObject] = this.step.stepDefinition.pageObjectInstances;
        [this.action] = this.pageObject.pageObject.actions;
    };

    return TaskModel;

    function toAST () {
        let ast = astCreatorService;

        let template = '<%= pageObject %>.<%= action %>(%= taskArguments %)';

        let taskArguments = this.arguments.map(argument => argument.ast);

        return ast.template(template, {
            pageObject: ast.identifier(this.pageObject.variableName),
            action: ast.identifier(this.action.variableName),
            taskArguments: taskArguments
        }).expression;
    }

    function parseArguments () {
        return this.action.parameters.map(parameter => new ArgumentModel(this.step.stepDefinition, { name: parameter.name }));
    }
}

StepDefinitionsModule.factory('TaskModel', createTaskModelConstructor);
