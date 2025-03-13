var GeneratorModule_1;
import { __decorate, __metadata } from "tslib";
import { ConsoleLogger, Inject, Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { ModuleKind, Project, ScriptTarget } from 'ts-morph';
import { TRPCGenerator } from './trpc.generator';
import { RouterGenerator } from './router.generator';
import { StaticGenerator } from './static.generator';
import { ContextGenerator } from './context.generator';
import { MiddlewareGenerator } from './middleware.generator';
import { DecoratorGenerator } from './decorator.generator';
import { ProcedureGenerator } from './procedure.generator';
import { TYPESCRIPT_APP_ROUTER_SOURCE_FILE, TYPESCRIPT_PROJECT, } from './generator.constants';
import { TRPC_GENERATOR_OPTIONS, TRPC_MODULE_CALLER_FILE_PATH, } from '../trpc.constants';
import { FactoryModule } from '../factories/factory.module';
import { ScannerModule } from '../scanners/scanner.module';
import * as path from 'node:path';
let GeneratorModule = GeneratorModule_1 = class GeneratorModule {
    static forRoot(options) {
        const defaultCompilerOptions = {
            target: ScriptTarget.ES2019,
            module: ModuleKind.CommonJS,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            allowJs: true,
            checkJs: true,
            esModuleInterop: true,
        };
        const project = new Project({ compilerOptions: defaultCompilerOptions });
        const appRouterSourceFile = project.createSourceFile(path.resolve(options.outputDirPath ?? './', 'server.ts'), () => { }, { overwrite: true });
        return {
            module: GeneratorModule_1,
            providers: [
                {
                    provide: TRPC_MODULE_CALLER_FILE_PATH,
                    useValue: options.rootModuleFilePath,
                },
                { provide: TYPESCRIPT_PROJECT, useValue: project },
                {
                    provide: TYPESCRIPT_APP_ROUTER_SOURCE_FILE,
                    useValue: appRouterSourceFile,
                },
                { provide: TRPC_GENERATOR_OPTIONS, useValue: options },
            ],
        };
    }
    async onModuleInit() {
        await this.trpcGenerator.generateSchemaFile(this.options.schemaFileImports);
        await this.trpcGenerator.generateHelpersFile(this.options.context);
    }
};
__decorate([
    Inject(TRPCGenerator),
    __metadata("design:type", TRPCGenerator)
], GeneratorModule.prototype, "trpcGenerator", void 0);
__decorate([
    Inject(TRPC_GENERATOR_OPTIONS),
    __metadata("design:type", Object)
], GeneratorModule.prototype, "options", void 0);
GeneratorModule = GeneratorModule_1 = __decorate([
    Module({
        imports: [FactoryModule, ScannerModule],
        providers: [
            // NestJS Providers
            ConsoleLogger,
            MetadataScanner,
            // Local Providers
            TRPCGenerator,
            RouterGenerator,
            ProcedureGenerator,
            DecoratorGenerator,
            MiddlewareGenerator,
            ContextGenerator,
            StaticGenerator,
        ],
        exports: [TRPCGenerator],
    })
], GeneratorModule);
export { GeneratorModule };
//# sourceMappingURL=generator.module.js.map