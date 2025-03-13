import { ProcedureParamDecoratorType, } from '../interfaces/factory.interface';
import { PROCEDURE_PARAM_METADATA_KEY } from '../trpc.constants';
export function Ctx() {
    return (target, propertyKey, parameterIndex) => {
        if (propertyKey != null && typeof parameterIndex === 'number') {
            const existingParams = Reflect.getMetadata(PROCEDURE_PARAM_METADATA_KEY, target, propertyKey) || [];
            const procedureParamMetadata = {
                type: ProcedureParamDecoratorType.Ctx,
                index: parameterIndex,
            };
            existingParams.push(procedureParamMetadata);
            Reflect.defineMetadata(PROCEDURE_PARAM_METADATA_KEY, existingParams, target, propertyKey);
        }
    };
}
//# sourceMappingURL=context.decorator.js.map