// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import './step-argument';

function createExpectationModelConstructor (
    astCreatorService,
    stringToLiteralService,
    StepArgumentModel
) {
    let ExpectationModel = function ExpectationModel (step) {
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
                    let [firstAction] = this.pageObject.meta.actions;
                    this.action = firstAction;
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
        [this.condition] = this.conditions;
        this.expectedResult = new StepArgumentModel(this.step.stepDefinition, { name: 'Expected result' });
    };

    ExpectationModel.prototype.conditions = ['equal', 'contain'];

    return ExpectationModel;

    function toAST () {
        let ast = astCreatorService;

        let template = 'expect(<%= pageObject %>.<%= action %>(%= expectationArguments %)).to.eventually.<%= condition %>(<%= expectedResult %>); ';

        let expectationArguments = this.arguments.map(argument => argument.ast);

        return ast.template(template, {
            pageObject: ast.identifier(this.pageObject.variableName),
            action: ast.identifier(this.action.variableName),
            expectationArguments: expectationArguments,
            condition: ast.identifier(this.condition),
            expectedResult: this.expectedResult.ast
        }).expression;
    }

    function parseArguments () {
        return this.action.parameters.map(parameter => new StepArgumentModel(this.step.stepDefinition, { name: parameter.name }));
    }
}

StepDefinitionsModule.factory('ExpectationModel', createExpectationModelConstructor);
