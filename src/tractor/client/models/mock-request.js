// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

// Dependencies:
import './header';

function createMockRequestModelConstructor (
    astCreatorService,
    HeaderModel
) {
    let MockRequestModel = function MockRequestModel (step) {
        let headers = [];

        Object.defineProperties(this, {
            headers: {
                get () {
                    return headers;
                }
            },
            step: {
                get () {
                    return step;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });

        this.url = '';
        [this.action] = this.actions;
        [this.data] = this.step.stepDefinition.mockRequestInstances;
        this.passThrough = false;
        this.status = 200;
    };

    MockRequestModel.prototype.actions = ['GET', 'POST', 'DELETE', 'PUT', 'HEAD', 'PATCH'];

    MockRequestModel.prototype.addHeader = function () {
        this.headers.push(new HeaderModel(this));
    };

    MockRequestModel.prototype.removeHeader = function (toRemove) {
        this.headers.splice(this.headers.indexOf(toRemove), 1);
    };

    return MockRequestModel;

    function toAST () {
        let ast = astCreatorService;

        let data = {
            // The RegExp constructor does not escape special characters, so we need to double-escape "\?" to "\\\?" in the string before creating the RegExp.
            url: ast.literal(new RegExp(this.url.replace(/\?/g,'\\\?')))
        };
        let template = 'mockRequests.when' + this.action + '(%= url %, {';
        if (this.passThrough) {
            template += 'passThrough: true';
        } else {
            template += 'body: <%= dataName %>,';
            data.dataName = ast.identifier(this.data.variableName);

            if (this.status) {
                data.status = ast.literal(+this.status);
                template += 'status: <%= status %>,';
            }

            if (this.headers.length) {
                template += 'headers: {';
                this.headers.forEach(header => template += header.ast + ',');
                template += '}';
            }
        }
        template += '});'

        return ast.template(template, data).expression;
    }
}

StepDefinitionsModule.factory('MockRequestModel', createMockRequestModelConstructor);
