import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
import * as trpcFastify from '@trpc/server/adapters/fastify';
let FastifyDriver = class FastifyDriver {
    async start(options, app, appRouter, contextInstance) {
        app.register(trpcFastify.fastifyTRPCPlugin, {
            prefix: options.basePath ?? '/trpc',
            trpcOptions: {
                router: appRouter,
                ...(options.context != null && contextInstance != null
                    ? {
                        createContext: (opts) => contextInstance.create(opts),
                    }
                    : {}),
            },
        });
    }
};
FastifyDriver = __decorate([
    Injectable()
], FastifyDriver);
export { FastifyDriver };
//# sourceMappingURL=fastify.driver.js.map