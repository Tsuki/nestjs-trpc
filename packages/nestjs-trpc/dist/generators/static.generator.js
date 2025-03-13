import { __decorate } from "tslib";
import { StructureKind, VariableDeclarationKind, } from 'ts-morph';
import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
let StaticGenerator = class StaticGenerator {
    generateStaticDeclaration(sourceFile) {
        sourceFile.addImportDeclaration({
            kind: StructureKind.ImportDeclaration,
            moduleSpecifier: '@trpc/server',
            namedImports: ['initTRPC'],
        });
        sourceFile.addImportDeclaration({
            kind: StructureKind.ImportDeclaration,
            moduleSpecifier: 'zod',
            namedImports: ['z'],
        });
        sourceFile.addVariableStatements([
            {
                declarationKind: VariableDeclarationKind.Const,
                declarations: [{ name: 't', initializer: 'initTRPC.create()' }],
            },
            {
                declarationKind: VariableDeclarationKind.Const,
                declarations: [{ name: 'publicProcedure', initializer: 't.procedure' }],
            },
        ]);
    }
    addSchemaImports(sourceFile, schemaImportNames, importsMap) {
        const importDeclarations = [];
        for (const schemaImportName of schemaImportNames) {
            for (const [importMapKey, importMapMetadata] of importsMap.entries()) {
                if (schemaImportName == null || importMapKey !== schemaImportName) {
                    continue;
                }
                const relativePath = path.relative(path.dirname(sourceFile.getFilePath()), importMapMetadata.sourceFile.getFilePath().replace(/\.ts$/, ''));
                importDeclarations.push({
                    kind: StructureKind.ImportDeclaration,
                    moduleSpecifier: relativePath.startsWith('.')
                        ? relativePath
                        : `./${relativePath}`,
                    namedImports: [schemaImportName],
                });
            }
        }
        sourceFile.addImportDeclarations(importDeclarations);
    }
    findCtxOutProperty(type) {
        const typeText = type.getText();
        const ctxOutMatch = typeText.match(/_ctx_out:\s*{([^}]*)}/);
        return ctxOutMatch ? ctxOutMatch[1].trim() : undefined;
    }
};
StaticGenerator = __decorate([
    Injectable()
], StaticGenerator);
export { StaticGenerator };
//# sourceMappingURL=static.generator.js.map