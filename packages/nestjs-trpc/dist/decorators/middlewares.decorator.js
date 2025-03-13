import { MIDDLEWARES_KEY } from '../trpc.constants';
import { isFunction } from 'lodash';
import { validateEach } from '../utils/validate-each.util';
/**
 * TODO: Generate Return Context Type.
 *
 * Decorator that binds middlewares to the scope of the router or a procedure,
 * depending on its context.
 *
 * When `@UseMiddlewares` is used at the router level, the middleware will be
 * applied to every handler (method) in the router.
 *
 * When `@UseMiddlewares` is used at the individual handler level, the middleware
 * will apply only to that specific method.
 *
 * @param middlewares a single middleware instance or class, or a list of comma separated middleware instances
 * or classes.
 *
 * @see [Middlewares](https://nestjs-trpc.io/docs/middlewares)
 *
 * @publicApi
 */
export function UseMiddlewares(...middlewares) {
    return (target, key, descriptor) => {
        const isMiddlewareValid = (middleware) => middleware &&
            (isFunction(middleware) ||
                isFunction(middleware.use));
        if (descriptor) {
            validateEach(target.constructor, middlewares, isMiddlewareValid, '@UseMiddlewares', 'middleware');
            Reflect.defineMetadata(MIDDLEWARES_KEY, [...middlewares], descriptor.value);
            return descriptor;
        }
        validateEach(target.constructor, middlewares, isMiddlewareValid, '@UseMiddlewares', 'middleware');
        Reflect.defineMetadata(MIDDLEWARES_KEY, [...middlewares], target);
        return target;
    };
}
/**
 * @deprecated Use `@UseMiddlewares` instead. This decorator is deprecated
 * in order to satisfy NestJS naming convention fe. `@UseGuards`.
 *
 * Decorator that binds middlewares to the scope of the router or a procedure,
 * depending on its context.
 *
 * When `@Middlewares` is used at the router level, the middleware will be
 * applied to every handler (method) in the router.
 *
 * When `@Middlewares` is used at the individual handler level, the middleware
 * will apply only to that specific method.
 *
 * @param middlewares a single middleware instance or class, or a list of comma separated middleware instances
 * or classes.
 *
 * @see [Middlewares](https://nestjs-trpc.io/docs/middlewares)
 *
 * @publicApi
 */
export function Middlewares(...middlewares) {
    return (target, key, descriptor) => {
        const isMiddlewareValid = (middleware) => middleware &&
            (isFunction(middleware) ||
                isFunction(middleware.use));
        if (descriptor) {
            validateEach(target.constructor, middlewares, isMiddlewareValid, '@Middlewares', 'middleware');
            Reflect.defineMetadata(MIDDLEWARES_KEY, [...middlewares], descriptor.value);
            return descriptor;
        }
        validateEach(target.constructor, middlewares, isMiddlewareValid, '@Middlewares', 'middleware');
        Reflect.defineMetadata(MIDDLEWARES_KEY, [...middlewares], target);
        return target;
    };
}
//# sourceMappingURL=middlewares.decorator.js.map