import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
let AppRouterHost = class AppRouterHost {
    set appRouter(schemaRef) {
        this._appRouter = schemaRef;
    }
    get appRouter() {
        if (!this._appRouter) {
            throw new Error('TRPC appRouter has not yet been created. ' +
                'Make sure to call the "AppRouterHost#appRouter" getter when the application is already initialized (after the "onModuleInit" hook triggered by either "app.listen()" or "app.init()" method).');
        }
        return this._appRouter;
    }
};
AppRouterHost = __decorate([
    Injectable()
], AppRouterHost);
export { AppRouterHost };
//# sourceMappingURL=app-router.host.js.map