import { __decorate, __metadata } from "tslib";
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { camelCase } from 'lodash';
import { MIDDLEWARES_KEY, ROUTER_METADATA_KEY } from '../trpc.constants';
import { ProcedureFactory } from './procedure.factory';
let RouterFactory = class RouterFactory {
    getRouters() {
        const routers = [];
        this.modulesContainer.forEach((moduleRef) => {
            moduleRef.providers.forEach((wrapper) => {
                const router = this.extractRouterFromWrapper(wrapper);
                if (router != null) {
                    routers.push(router);
                }
            });
        });
        return routers;
    }
    extractRouterFromWrapper(wrapper) {
        const { instance, name } = wrapper;
        if (instance == null) {
            return null;
        }
        const router = Reflect.getMetadata(ROUTER_METADATA_KEY, instance.constructor);
        if (router == null) {
            return null;
        }
        const middlewares = Reflect.getMetadata(MIDDLEWARES_KEY, instance.constructor) || [];
        return {
            name,
            instance,
            path: router.path,
            alias: router.alias,
            middlewares: middlewares,
        };
    }
    serializeRoutes(router, procedure) {
        const routers = this.getRouters();
        const routerSchema = Object.create({});
        routers.forEach((route) => {
            const { instance, name, middlewares, alias } = route;
            const camelCasedRouterName = camelCase(alias ?? name);
            const prototype = Object.getPrototypeOf(instance);
            const procedures = this.procedureFactory.getProcedures(instance, prototype);
            this.consoleLogger.log(`Router ${name} as ${camelCasedRouterName}.`, 'Router Factory');
            const routerProcedures = this.procedureFactory.serializeProcedures(procedures, instance, camelCasedRouterName, procedure, middlewares);
            // TODO: To get this working with `trpc` v11, we need to remove the `router()` method from here.
            routerSchema[camelCasedRouterName] = router(routerProcedures);
        });
        return routerSchema;
    }
};
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], RouterFactory.prototype, "consoleLogger", void 0);
__decorate([
    Inject(ModulesContainer),
    __metadata("design:type", ModulesContainer)
], RouterFactory.prototype, "modulesContainer", void 0);
__decorate([
    Inject(ProcedureFactory),
    __metadata("design:type", ProcedureFactory)
], RouterFactory.prototype, "procedureFactory", void 0);
RouterFactory = __decorate([
    Injectable()
], RouterFactory);
export { RouterFactory };
//# sourceMappingURL=router.factory.js.map