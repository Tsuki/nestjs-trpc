import { __decorate, __metadata } from "tslib";
import { Inject, Injectable } from '@nestjs/common';
import { ProcedureType } from '../trpc.enum';
import { SourceFile, Node } from 'ts-morph';
import { ImportsScanner } from '../scanners/imports.scanner';
import { StaticGenerator } from './static.generator';
import { TYPESCRIPT_APP_ROUTER_SOURCE_FILE } from './generator.constants';
let ProcedureGenerator = class ProcedureGenerator {
    generateProcedureString(procedure) {
        const { name, decorators } = procedure;
        const decorator = decorators.find((decorator) => decorator.name === ProcedureType.Mutation ||
            decorator.name === ProcedureType.Query);
        if (!decorator) {
            return '';
        }
        const decoratorArgumentsArray = Object.entries(decorator.arguments)
            .map(([key, value]) => `.${key}(${value})`)
            .join('');
        return `${name}: publicProcedure${decoratorArgumentsArray}.${decorator.name.toLowerCase()}(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )`;
    }
    flattenZodSchema(node, sourceFile, project, schema) {
        const importsMap = this.importsScanner.buildSourceFileImportsMap(sourceFile, project);
        if (Node.isIdentifier(node)) {
            const identifierName = node.getText();
            const identifierDeclaration = sourceFile.getVariableDeclaration(identifierName);
            if (identifierDeclaration != null) {
                const identifierInitializer = identifierDeclaration.getInitializer();
                if (identifierInitializer != null) {
                    const identifierSchema = this.flattenZodSchema(identifierInitializer, sourceFile, project, identifierInitializer.getText());
                    schema = schema.replace(identifierName, identifierSchema);
                }
            }
            else if (importsMap.has(identifierName)) {
                const importedIdentifier = importsMap.get(identifierName);
                if (importedIdentifier != null) {
                    const { initializer } = importedIdentifier;
                    const identifierSchema = this.flattenZodSchema(initializer, importedIdentifier.sourceFile, project, initializer.getText());
                    schema = schema.replace(identifierName, identifierSchema);
                }
            }
        }
        else if (Node.isObjectLiteralExpression(node)) {
            for (const property of node.getProperties()) {
                if (Node.isPropertyAssignment(property)) {
                    const propertyText = property.getText();
                    const propertyInitializer = property.getInitializer();
                    if (propertyInitializer != null) {
                        schema = schema.replace(propertyText, this.flattenZodSchema(propertyInitializer, sourceFile, project, propertyText));
                    }
                }
            }
        }
        else if (Node.isArrayLiteralExpression(node)) {
            for (const element of node.getElements()) {
                const elementText = element.getText();
                schema = schema.replace(elementText, this.flattenZodSchema(element, sourceFile, project, elementText));
            }
        }
        else if (Node.isCallExpression(node)) {
            const expression = node.getExpression();
            if (Node.isPropertyAccessExpression(expression) &&
                !expression.getText().startsWith('z')) {
                const baseSchema = this.flattenZodSchema(expression, sourceFile, project, expression.getText());
                const propertyName = expression.getName();
                schema = schema.replace(expression.getText(), `${baseSchema}.${propertyName}`);
            }
            else if (!expression.getText().startsWith('z')) {
                this.staticGenerator.addSchemaImports(this.appRouterSourceFile, [expression.getText()], importsMap);
            }
            for (const arg of node.getArguments()) {
                const argText = arg.getText();
                schema = schema.replace(argText, this.flattenZodSchema(arg, sourceFile, project, argText));
            }
        }
        else if (Node.isPropertyAccessExpression(node)) {
            schema = this.flattenZodSchema(node.getExpression(), sourceFile, project, node.getExpression().getText());
        }
        return schema;
    }
};
__decorate([
    Inject(ImportsScanner),
    __metadata("design:type", ImportsScanner)
], ProcedureGenerator.prototype, "importsScanner", void 0);
__decorate([
    Inject(StaticGenerator),
    __metadata("design:type", StaticGenerator)
], ProcedureGenerator.prototype, "staticGenerator", void 0);
__decorate([
    Inject(TYPESCRIPT_APP_ROUTER_SOURCE_FILE),
    __metadata("design:type", SourceFile)
], ProcedureGenerator.prototype, "appRouterSourceFile", void 0);
ProcedureGenerator = __decorate([
    Injectable()
], ProcedureGenerator);
export { ProcedureGenerator };
//# sourceMappingURL=procedure.generator.js.map