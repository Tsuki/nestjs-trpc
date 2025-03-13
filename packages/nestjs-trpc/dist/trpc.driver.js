import { __decorate, __metadata } from "tslib";
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { initTRPC } from '@trpc/server';
import { TRPCFactory } from './factories/trpc.factory';
import { AppRouterHost } from './app-router.host';
import { ExpressDriver, FastifyDriver } from './drivers';
function isExpressApplication(app) {
    return (typeof app === 'function' &&
        typeof app.get === 'function' &&
        typeof app.post === 'function' &&
        typeof app.use === 'function' &&
        typeof app.listen === 'function');
}
function isFastifyApplication(app) {
    return (typeof app === 'object' &&
        app !== null &&
        typeof app.get === 'function' &&
        typeof app.post === 'function' &&
        typeof app.register === 'function' &&
        typeof app.listen === 'function');
}
let TRPCDriver = class TRPCDriver {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    async start(options) {
        //@ts-expect-error Ignoring typescript here since it's the same type, yet it still isn't able to infer it.
        const { procedure, router } = initTRPC.context().create({
            ...(options.transformer != null
                ? { transformer: options.transformer }
                : {}),
            ...(options.errorFormatter != null
                ? { errorFormatter: options.errorFormatter }
                : {}),
        });
        const appRouter = this.trpcFactory.serializeAppRoutes(router, procedure);
        this.appRouterHost.appRouter = appRouter;
        const contextClass = options.context;
        const contextInstance = contextClass != null
            ? this.moduleRef.get(contextClass, {
                strict: false,
            })
            : null;
        const { httpAdapter } = this.httpAdapterHost;
        const platformName = httpAdapter.getType();
        const app = httpAdapter.getInstance();
        if (platformName === 'express' && isExpressApplication(app)) {
            await this.expressDriver.start(options, app, appRouter, contextInstance);
        }
        else if (platformName === 'fastify' && isFastifyApplication(app)) {
            await this.fastifyDriver.start(options, app, appRouter, contextInstance);
        }
        else {
            throw new Error(`Unsupported http adapter: ${platformName}`);
        }
    }
};
__decorate([
    Inject(HttpAdapterHost),
    __metadata("design:type", HttpAdapterHost)
], TRPCDriver.prototype, "httpAdapterHost", void 0);
__decorate([
    Inject(TRPCFactory),
    __metadata("design:type", TRPCFactory)
], TRPCDriver.prototype, "trpcFactory", void 0);
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], TRPCDriver.prototype, "consoleLogger", void 0);
__decorate([
    Inject(AppRouterHost),
    __metadata("design:type", AppRouterHost)
], TRPCDriver.prototype, "appRouterHost", void 0);
__decorate([
    Inject(ExpressDriver),
    __metadata("design:type", ExpressDriver)
], TRPCDriver.prototype, "expressDriver", void 0);
__decorate([
    Inject(FastifyDriver),
    __metadata("design:type", FastifyDriver)
], TRPCDriver.prototype, "fastifyDriver", void 0);
TRPCDriver = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ModuleRef])
], TRPCDriver);
export { TRPCDriver };
//# sourceMappingURL=trpc.driver.js.map