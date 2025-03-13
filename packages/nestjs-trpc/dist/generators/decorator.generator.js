import { __decorate, __metadata } from "tslib";
import { SyntaxKind, } from 'ts-morph';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { ProcedureGenerator } from './procedure.generator';
let DecoratorGenerator = class DecoratorGenerator {
    serializeProcedureDecorators(decorators, sourceFile, project) {
        return decorators.reduce((array, decorator) => {
            const decoratorName = decorator.getName();
            if (decoratorName === 'Query' || decoratorName === 'Mutation') {
                const input = this.getDecoratorPropertyValue(decorator, 'input', sourceFile, project);
                const output = this.getDecoratorPropertyValue(decorator, 'output', sourceFile, project);
                array.push({
                    name: decoratorName,
                    arguments: {
                        ...(input ? { input } : {}),
                        ...(output ? { output } : {}),
                    },
                });
            }
            else if (decoratorName === 'UseMiddlewares' ||
                decoratorName === 'Middlewares') {
                return array;
            }
            else {
                this.consoleLogger.warn(`Decorator ${decoratorName}, not supported.`);
            }
            return array;
        }, []);
    }
    getDecoratorPropertyValue(decorator, propertyName, sourceFile, project) {
        const args = decorator.getArguments();
        for (const arg of args) {
            if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
                const properties = arg.getProperties();
                const property = properties.find((p) => p.getName() === propertyName);
                if (!property) {
                    return null;
                }
                const propertyInitializer = property.getInitializer();
                return this.procedureGenerator.flattenZodSchema(propertyInitializer, sourceFile, project, propertyInitializer.getText());
            }
        }
        return null;
    }
};
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], DecoratorGenerator.prototype, "consoleLogger", void 0);
__decorate([
    Inject(ProcedureGenerator),
    __metadata("design:type", ProcedureGenerator)
], DecoratorGenerator.prototype, "procedureGenerator", void 0);
DecoratorGenerator = __decorate([
    Injectable()
], DecoratorGenerator);
export { DecoratorGenerator };
//# sourceMappingURL=decorator.generator.js.map