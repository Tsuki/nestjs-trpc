import { __decorate, __metadata } from "tslib";
import * as path from 'node:path';
import { ConsoleLogger, Inject, Injectable, } from '@nestjs/common';
import { Project, SourceFile } from 'ts-morph';
import { saveOrOverrideFile } from '../utils/ts-morph.util';
import { RouterGenerator } from './router.generator';
import { MiddlewareGenerator } from './middleware.generator';
import { ContextGenerator } from './context.generator';
import { RouterFactory } from '../factories/router.factory';
import { MiddlewareFactory } from '../factories/middleware.factory';
import { ProcedureFactory } from '../factories/procedure.factory';
import { TRPC_MODULE_CALLER_FILE_PATH } from '../trpc.constants';
import { StaticGenerator } from './static.generator';
import { ImportsScanner } from '../scanners/imports.scanner';
import { TYPESCRIPT_APP_ROUTER_SOURCE_FILE, TYPESCRIPT_PROJECT, } from './generator.constants';
import * as process from 'node:process';
let TRPCGenerator = class TRPCGenerator {
    constructor() {
        this.HELPER_TYPES_OUTPUT_FILE = 'index.ts';
        this.HELPER_TYPES_OUTPUT_PATH = path.join(__dirname, 'types');
    }
    onModuleInit() {
        this.rootModuleImportsMap = this.buildRootImportsMap();
    }
    async generateSchemaFile(schemaImports) {
        try {
            const routers = this.routerFactory.getRouters();
            const mappedRoutesAndProcedures = routers.map((route) => {
                const { instance, name, alias, path } = route;
                const prototype = Object.getPrototypeOf(instance);
                const procedures = this.procedureFactory.getProcedures(instance, prototype);
                return { name, path, alias, instance: { ...route }, procedures };
            });
            this.staticGenerator.generateStaticDeclaration(this.appRouterSourceFile);
            if (schemaImports != null && schemaImports.length > 0) {
                const schemaImportNames = schemaImports.map((schemaImport) => schemaImport.name);
                this.staticGenerator.addSchemaImports(this.appRouterSourceFile, schemaImportNames, this.rootModuleImportsMap);
            }
            const routersMetadata = this.serializerHandler.serializeRouters(mappedRoutesAndProcedures, this.project);
            const routersStringDeclarations = this.serializerHandler.generateRoutersStringFromMetadata(routersMetadata);
            this.appRouterSourceFile.addStatements(/* ts */ `
        const appRouter = t.router({${routersStringDeclarations}});
        export type AppRouter = typeof appRouter;
      `);
            await saveOrOverrideFile(this.appRouterSourceFile);
            this.consoleLogger.log(`AppRouter has been updated successfully at "./${path.relative(process.cwd(), this.appRouterSourceFile.getFilePath())}".`, 'TRPC Generator');
        }
        catch (error) {
            this.consoleLogger.warn('TRPC Generator encountered an error.', error);
        }
    }
    async generateHelpersFile(context) {
        try {
            const middlewares = this.middlewareFactory.getMiddlewares();
            const helperTypesSourceFile = this.project.createSourceFile(path.resolve(this.HELPER_TYPES_OUTPUT_PATH, this.HELPER_TYPES_OUTPUT_FILE), undefined, { overwrite: true });
            if (context != null) {
                const contextImport = this.rootModuleImportsMap.get(context.name);
                if (contextImport == null) {
                    throw new Error('Could not find context import declaration.');
                }
                const contextType = await this.contextHandler.getContextInterface(contextImport.sourceFile, context);
                helperTypesSourceFile.addTypeAlias({
                    isExported: true,
                    name: 'Context',
                    type: contextType ?? '{}',
                });
            }
            for (const middleware of middlewares) {
                const middlewareInterface = await this.middlewareHandler.getMiddlewareInterface(middleware.path, middleware.instance, this.project);
                if (middlewareInterface != null) {
                    helperTypesSourceFile.addInterface({
                        isExported: true,
                        name: `${middlewareInterface.name}Context`,
                        extends: ['Context'],
                        properties: middlewareInterface.properties,
                    });
                }
            }
            await saveOrOverrideFile(helperTypesSourceFile);
            this.consoleLogger.log(`Helper types has been updated successfully at "nestjs-trpc/types".`, 'TRPC Generator');
        }
        catch (e) {
            this.consoleLogger.warn('TRPC Generator encountered an error.', e);
        }
    }
    buildRootImportsMap() {
        const rootModuleSourceFile = this.project.addSourceFileAtPathIfExists(this.moduleCallerFilePath);
        if (rootModuleSourceFile == null) {
            throw new Error('Could not access root module file.');
        }
        return this.importsScanner.buildSourceFileImportsMap(rootModuleSourceFile, this.project);
    }
};
__decorate([
    Inject(TRPC_MODULE_CALLER_FILE_PATH),
    __metadata("design:type", String)
], TRPCGenerator.prototype, "moduleCallerFilePath", void 0);
__decorate([
    Inject(TYPESCRIPT_PROJECT),
    __metadata("design:type", Project)
], TRPCGenerator.prototype, "project", void 0);
__decorate([
    Inject(TYPESCRIPT_APP_ROUTER_SOURCE_FILE),
    __metadata("design:type", SourceFile)
], TRPCGenerator.prototype, "appRouterSourceFile", void 0);
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], TRPCGenerator.prototype, "consoleLogger", void 0);
__decorate([
    Inject(StaticGenerator),
    __metadata("design:type", StaticGenerator)
], TRPCGenerator.prototype, "staticGenerator", void 0);
__decorate([
    Inject(MiddlewareGenerator),
    __metadata("design:type", MiddlewareGenerator)
], TRPCGenerator.prototype, "middlewareHandler", void 0);
__decorate([
    Inject(ContextGenerator),
    __metadata("design:type", ContextGenerator)
], TRPCGenerator.prototype, "contextHandler", void 0);
__decorate([
    Inject(RouterGenerator),
    __metadata("design:type", RouterGenerator)
], TRPCGenerator.prototype, "serializerHandler", void 0);
__decorate([
    Inject(RouterFactory),
    __metadata("design:type", RouterFactory)
], TRPCGenerator.prototype, "routerFactory", void 0);
__decorate([
    Inject(ProcedureFactory),
    __metadata("design:type", ProcedureFactory)
], TRPCGenerator.prototype, "procedureFactory", void 0);
__decorate([
    Inject(MiddlewareFactory),
    __metadata("design:type", MiddlewareFactory)
], TRPCGenerator.prototype, "middlewareFactory", void 0);
__decorate([
    Inject(ImportsScanner),
    __metadata("design:type", ImportsScanner)
], TRPCGenerator.prototype, "importsScanner", void 0);
TRPCGenerator = __decorate([
    Injectable()
], TRPCGenerator);
export { TRPCGenerator };
//# sourceMappingURL=trpc.generator.js.map