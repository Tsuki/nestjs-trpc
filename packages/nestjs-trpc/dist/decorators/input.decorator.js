import { ProcedureParamDecoratorType, } from '../interfaces/factory.interface';
import { PROCEDURE_PARAM_METADATA_KEY } from '../trpc.constants';
/**
 * Input procedure parameter decorator. Extracts the `input` parameter out of the procedure `opts`.
 *
 * @param key string to be used extracting a specific input key - `input[key]`.
 *
 * @see [Parameter Decorators](https://www.nestjs-trpc.io/docs/routers#parameter-decorators)
 *
 * @publicApi
 */
export function Input(key) {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey != null && typeof parameterIndex === 'number') {
            const existingParams = Reflect.getMetadata(PROCEDURE_PARAM_METADATA_KEY, target, propertyKey) || [];
            const procedureParamMetadata = {
                type: ProcedureParamDecoratorType.Input,
                index: parameterIndex,
                key,
            };
            existingParams.push(procedureParamMetadata);
            Reflect.defineMetadata(PROCEDURE_PARAM_METADATA_KEY, existingParams, target, propertyKey);
        }
    };
}
//# sourceMappingURL=input.decorator.js.map