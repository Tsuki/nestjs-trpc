import { __decorate } from "tslib";
import { Node, SyntaxKind, } from 'ts-morph';
import { Injectable } from '@nestjs/common';
let MiddlewareGenerator = class MiddlewareGenerator {
    async getMiddlewareInterface(routerFilePath, middleware, project) {
        const className = middleware.name;
        if (!className) {
            return null;
        }
        const middlewareInstance = new middleware();
        if (typeof middlewareInstance.use !== 'function') {
            return null;
        }
        const contextSourceFile = project.addSourceFileAtPath(routerFilePath);
        const classDeclaration = this.getClassDeclaration(contextSourceFile, middleware.name);
        if (!classDeclaration) {
            return null;
        }
        const useMethod = classDeclaration.getMethod('use');
        if (!useMethod) {
            return null;
        }
        const ctxType = this.extractCtxTypeFromUseMethod(useMethod);
        if (!ctxType) {
            return null;
        }
        return {
            name: className,
            properties: this.typeToProperties(ctxType),
        };
    }
    extractCtxTypeFromUseMethod(useMethod) {
        const body = useMethod.getBody();
        if (!body)
            return null;
        // Find the call to opts.next()
        const nextCall = body
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .find((call) => {
            const expression = call.getExpression();
            return (Node.isPropertyAccessExpression(expression) &&
                expression.getName() === 'next' &&
                Node.isIdentifier(expression.getExpression()) &&
                expression.getExpression().getText() === 'opts');
        });
        if (!nextCall)
            return null;
        // Get the argument passed to opts.next()
        const nextArg = nextCall.getArguments()[0];
        if (!Node.isObjectLiteralExpression(nextArg))
            return null;
        // Find the 'ctx' property in the argument
        const ctxProperty = nextArg
            .getProperties()
            .find((prop) => Node.isPropertyAssignment(prop) && prop.getName() === 'ctx');
        if (!Node.isPropertyAssignment(ctxProperty))
            return null;
        // Get the type of the 'ctx' property value
        return ctxProperty.getInitializer()?.getType() || null;
    }
    getClassDeclaration(sourceFile, className) {
        const classDeclaration = sourceFile.getClass(className);
        if (classDeclaration) {
            return classDeclaration;
        }
        return undefined;
    }
    typeToProperties(type) {
        const properties = [];
        if (type.isObject()) {
            type.getProperties().forEach((prop) => {
                const propValueDeclaration = prop.getValueDeclaration();
                if (propValueDeclaration != null) {
                    properties.push({
                        name: prop.getName(),
                        type: prop.getTypeAtLocation(propValueDeclaration).getText(),
                    });
                }
            });
        }
        return properties;
    }
};
MiddlewareGenerator = __decorate([
    Injectable()
], MiddlewareGenerator);
export { MiddlewareGenerator };
//# sourceMappingURL=middleware.generator.js.map