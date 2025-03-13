import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
import * as trpcExpress from '@trpc/server/adapters/express';
let ExpressDriver = class ExpressDriver {
    async start(options, app, appRouter, contextInstance) {
        app.use(options.basePath ?? '/trpc', trpcExpress.createExpressMiddleware({
            router: appRouter,
            ...(options.context != null && contextInstance != null
                ? {
                    createContext: (opts) => contextInstance.create(opts),
                }
                : {}),
        }));
    }
};
ExpressDriver = __decorate([
    Injectable()
], ExpressDriver);
export { ExpressDriver };
//# sourceMappingURL=express.driver.js.map