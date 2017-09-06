// Module:
import { StepDefinitionsModule } from '../step-definitions.module';

function createArgumentModelConstructor (
    astCreatorService,
    stringToLiteralService
) {
    return function ArgumentModel (stepDefinition, argument) {
        Object.defineProperties(this, {
            stepDefinition: {
                get () {
                    return stepDefinition;
                }
            },
            name: {
                get () {
                    return argument.name;
                }
            },
            ast: {
                get () {
                    return toAST.call(this);
                }
            }
        });

        this.value = '';
    }

    function toAST () {
        let ast = astCreatorService;

        let literal = stringToLiteralService.toLiteral(this.value);
        let parameter = findParameter.call(this);

        if (literal !== undefined && literal !== this.value) {
            return ast.literal(literal);
        } else if (parameter) {
            return ast.identifier(parameter.variableName);
        } else if (this.value) {
            return ast.literal(this.value);
        } else {
            return ast.literal(null);
        }
    }

    function findParameter () {
        return this.stepDefinition.parameters.find(parameter => {
            return parameter.variableName === this.value;
        });
    }
}

StepDefinitionsModule.factory('ArgumentModel', createArgumentModelConstructor);
