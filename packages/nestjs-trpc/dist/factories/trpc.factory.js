import { __decorate, __metadata } from "tslib";
import { Inject, Injectable } from '@nestjs/common';
import { RouterFactory } from './router.factory';
let TRPCFactory = class TRPCFactory {
    serializeAppRoutes(router, procedure) {
        const routerSchema = this.routerFactory.serializeRoutes(router, procedure);
        return router(routerSchema);
    }
};
__decorate([
    Inject(RouterFactory),
    __metadata("design:type", RouterFactory)
], TRPCFactory.prototype, "routerFactory", void 0);
TRPCFactory = __decorate([
    Injectable()
], TRPCFactory);
export { TRPCFactory };
//# sourceMappingURL=trpc.factory.js.map