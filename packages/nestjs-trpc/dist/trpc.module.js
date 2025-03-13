var TRPCModule_1;
import { __decorate, __metadata } from "tslib";
import { ConsoleLogger, Inject, Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LOGGER_CONTEXT, TRPC_MODULE_OPTIONS } from './trpc.constants';
import { TRPCDriver } from './trpc.driver';
import { AppRouterHost } from './app-router.host';
import { ExpressDriver, FastifyDriver } from './drivers';
import { FileScanner } from './scanners/file.scanner';
import { GeneratorModule } from './generators/generator.module';
import { FactoryModule } from './factories/factory.module';
import { ScannerModule } from './scanners/scanner.module';
let TRPCModule = TRPCModule_1 = class TRPCModule {
    static forRoot(options = {}) {
        const imports = [];
        if (options.autoSchemaFile != null) {
            const fileScanner = new FileScanner();
            const callerFilePath = fileScanner.getCallerFilePath();
            imports.push(GeneratorModule.forRoot({
                outputDirPath: options.autoSchemaFile,
                rootModuleFilePath: callerFilePath,
                schemaFileImports: options.schemaFileImports,
                context: options.context,
            }));
        }
        return {
            module: TRPCModule_1,
            imports,
            providers: [{ provide: TRPC_MODULE_OPTIONS, useValue: options }],
        };
    }
    async onModuleInit() {
        const httpAdapter = this.httpAdapterHost?.httpAdapter;
        if (!httpAdapter) {
            return;
        }
        this.consoleLogger.setContext(LOGGER_CONTEXT);
        await this.trpcDriver.start(this.options);
        const platformName = httpAdapter.getType();
        if (this.appRouterHost.appRouter != null) {
            this.consoleLogger.log(`Server has been initialized successfully using the ${platformName} driver.`, 'TRPC Server');
        }
    }
};
__decorate([
    Inject(TRPC_MODULE_OPTIONS),
    __metadata("design:type", Object)
], TRPCModule.prototype, "options", void 0);
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], TRPCModule.prototype, "consoleLogger", void 0);
__decorate([
    Inject(HttpAdapterHost),
    __metadata("design:type", HttpAdapterHost)
], TRPCModule.prototype, "httpAdapterHost", void 0);
__decorate([
    Inject(TRPCDriver),
    __metadata("design:type", TRPCDriver)
], TRPCModule.prototype, "trpcDriver", void 0);
__decorate([
    Inject(AppRouterHost),
    __metadata("design:type", AppRouterHost)
], TRPCModule.prototype, "appRouterHost", void 0);
TRPCModule = TRPCModule_1 = __decorate([
    Module({
        imports: [FactoryModule, ScannerModule],
        providers: [
            // NestJS Providers
            ConsoleLogger,
            // Drivers
            TRPCDriver,
            FastifyDriver,
            ExpressDriver,
            // Exports
            AppRouterHost,
        ],
        exports: [AppRouterHost],
    })
], TRPCModule);
export { TRPCModule };
//# sourceMappingURL=trpc.module.js.map