import { ProcedureParamDecoratorType, } from '../interfaces/factory.interface';
import { PROCEDURE_PARAM_METADATA_KEY } from '../trpc.constants';
/**
 * Options procedure parameter decorator. Extracts the root `opts` parameter out of the procedure.
 *
 * @see [Parameter Decorators](https://www.nestjs-trpc.io/docs/routers#parameter-decorators)
 *
 * @publicApi
 */
export function Options() {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey != null) {
            const existingParams = Reflect.getMetadata(PROCEDURE_PARAM_METADATA_KEY, target, propertyKey) || [];
            const procedureParamMetadata = {
                type: ProcedureParamDecoratorType.Options,
                index: parameterIndex,
            };
            existingParams.push(procedureParamMetadata);
            Reflect.defineMetadata(PROCEDURE_PARAM_METADATA_KEY, existingParams, target, propertyKey);
        }
    };
}
//# sourceMappingURL=options.decorator.js.map