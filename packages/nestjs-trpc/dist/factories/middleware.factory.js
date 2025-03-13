import { __decorate, __metadata } from "tslib";
import { Inject, Injectable } from '@nestjs/common';
import { RouterFactory } from './router.factory';
import { ProcedureFactory } from './procedure.factory';
import { isEqual, uniqWith } from 'lodash';
let MiddlewareFactory = class MiddlewareFactory {
    getMiddlewares() {
        const routers = this.routerFactory.getRouters();
        const middlewaresMetadata = routers.flatMap((router) => {
            const { instance, middlewares, path } = router;
            const prototype = Object.getPrototypeOf(instance);
            const procedures = this.procedureFactory.getProcedures(instance, prototype);
            const procedureMiddleware = procedures.flatMap((procedure) => {
                return procedure.middlewares ?? [];
            });
            return [...middlewares, ...procedureMiddleware].map((middleware) => ({
                path,
                instance: middleware,
            }));
        });
        // Return a unique array of middlewares based on both path and instances
        return uniqWith(middlewaresMetadata, isEqual);
    }
};
__decorate([
    Inject(RouterFactory),
    __metadata("design:type", RouterFactory)
], MiddlewareFactory.prototype, "routerFactory", void 0);
__decorate([
    Inject(ProcedureFactory),
    __metadata("design:type", ProcedureFactory)
], MiddlewareFactory.prototype, "procedureFactory", void 0);
MiddlewareFactory = __decorate([
    Injectable()
], MiddlewareFactory);
export { MiddlewareFactory };
//# sourceMappingURL=middleware.factory.js.map