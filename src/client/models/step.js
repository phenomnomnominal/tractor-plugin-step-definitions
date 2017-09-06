// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import './expectation';
import './mock-request';
import './task';

function createStepModelConstructor (
    astCreatorService,
    ExpectationModel,
    TaskModel,
    MockRequestModel
) {
    let StepModel = function StepModel (stepDefinition) {
        let expectations = [];
        let tasks = [];
        let mocks = [];

        Object.defineProperties(this, {
            stepDefinition: {
                get () {
                    return stepDefinition;
                }
            },
            expectations: {
                get () {
                    return expectations;
                }
            },
            tasks: {
                get () {
                    return tasks;
                }
            },
            mocks: {
                get () {
                    return mocks;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });
    };

    StepModel.prototype.stepTypes = ['Given', 'When', 'Then', 'And', 'But'];

    StepModel.prototype.addExpectation = function () {
        this.expectations.push(new ExpectationModel(this));
    };

    StepModel.prototype.removeExpectation = function (toRemove) {
        this.expectations.splice(this.expectations.indexOf(toRemove), 1);
    };

    StepModel.prototype.addTask = function () {
        this.tasks.push(new TaskModel(this));
    };

    StepModel.prototype.removeTask = function (toRemove) {
        this.tasks.splice(this.tasks.indexOf(toRemove), 1);
    };

    StepModel.prototype.addMock = function () {
        this.mocks.push(new MockRequestModel(this));
    };

    StepModel.prototype.removeMock = function (toRemove) {
        this.mocks.splice(this.mocks.indexOf(toRemove), 1);
    };

    return StepModel;

    function toAST () {
        let ast = astCreatorService;

        let expectations = this.expectations.map(expectation => expectation.ast);
        let mocks = this.mocks.map(mock => mock.ast);
        let tasks = this.tasks.map(task => task.ast);

        let parameters = this.stepDefinition.parameters.map(parameter => parameter.ast);
        parameters.push(ast.identifier('done'));

        let template = 'this.<%= type %>(<%= regex %>, function (%= parameters %) { ';
        if (mocks.length) {
            template += 'Promise.all([%= mocks %]).spread(function () { done(); }).catch(done.fail);';
        } else if (tasks.length) {
            template += 'var tasks = <%= tasks[0] %>';
            tasks.slice(1).forEach((taskAST, index) => {
                template += '.then(function () { return <%= tasks[' + (index + 1) + '] %>; })';
            });
            template += ';';
            template += 'Promise.resolve(tasks).then(done).catch(done.fail);';
        } else if (expectations.length) {
            template += 'Promise.all([%= expectations %]).spread(function () { done(); }).catch(done.fail);';
        } else {
            template += 'done(null, \'pending\');';
        }
        template += '});';

        return ast.template(template, {
            parameters,
            type: ast.identifier(this.type),
            regex: ast.literal(this.regex),
            mocks,
            tasks,
            expectations
        });
    }
};

StepDefinitionsModule.factory('StepModel', createStepModelConstructor);
