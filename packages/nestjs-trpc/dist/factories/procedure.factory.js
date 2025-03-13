import { __decorate, __metadata } from "tslib";
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import { MIDDLEWARES_KEY, PROCEDURE_METADATA_KEY, PROCEDURE_PARAM_METADATA_KEY, PROCEDURE_TYPE_KEY, } from '../trpc.constants';
import { ProcedureParamDecoratorType, } from '../interfaces/factory.interface';
import { ProcedureType } from '../trpc.enum';
import { uniqWith, isEqual } from 'lodash';
let ProcedureFactory = class ProcedureFactory {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    getProcedures(instance, prototype) {
        const methodNames = this.metadataScanner.getAllMethodNames(instance);
        return methodNames.map((name) => this.extractProcedureMetadata(name, prototype));
    }
    extractProcedureParams(prototype, name) {
        return Reflect.getMetadata(PROCEDURE_PARAM_METADATA_KEY, prototype, name);
    }
    extractProcedureMetadata(name, prototype) {
        const callback = prototype[name];
        const type = Reflect.getMetadata(PROCEDURE_TYPE_KEY, callback);
        const metadata = Reflect.getMetadata(PROCEDURE_METADATA_KEY, callback);
        const middlewares = Reflect.getMetadata(MIDDLEWARES_KEY, callback) || [];
        return {
            input: metadata?.input,
            output: metadata?.output,
            middlewares,
            type,
            name: callback.name,
            implementation: callback,
            params: this.extractProcedureParams(prototype, name),
        };
    }
    serializeProcedures(procedures, instance, camelCasedRouterName, procedureBuilder, routerMiddlewares) {
        const serializedProcedures = Object.create({});
        for (const procedure of procedures) {
            const { input, output, type, middlewares, name, params } = procedure;
            const uniqueMiddlewares = uniqWith([...routerMiddlewares, ...middlewares], isEqual);
            const procedureInstance = this.createProcedureInstance(procedureBuilder, uniqueMiddlewares);
            const routerInstance = this.moduleRef.get(instance.constructor, {
                strict: false,
            });
            serializedProcedures[name] = this.createSerializedProcedure(procedureInstance, name, input, output, type, routerInstance, params);
            this.consoleLogger.log(`Mapped {${type}, ${camelCasedRouterName}.${name}} route.`, 'Router Factory');
        }
        return serializedProcedures;
    }
    createProcedureInstance(procedure, middlewares) {
        for (const middleware of middlewares) {
            const customProcedureInstance = this.moduleRef.get(middleware, {
                strict: false,
            });
            if (typeof customProcedureInstance.use === 'function') {
                //@ts-expect-error this is expected since the type is correct.
                procedure = procedure.use((opts) => customProcedureInstance.use(opts));
            }
        }
        return procedure;
    }
    serializeProcedureParams(opts, params) {
        if (params == null) {
            return [];
        }
        return new Array(Math.max(...params.map((val) => val.index)) + 1)
            .fill(undefined)
            .map((_val, idx) => {
            const param = params.find((param) => param.index === idx);
            if (param == null) {
                return undefined;
            }
            if (param.type === ProcedureParamDecoratorType.Input) {
                return param['key'] != null
                    ? opts[param.type]?.[param['key']]
                    : opts[param.type];
            }
            if (param.type === ProcedureParamDecoratorType.Options) {
                return opts;
            }
            return opts[param.type];
        });
    }
    createSerializedProcedure(procedureInstance, procedureName, input, output, type, routerInstance, params) {
        const procedureWithInput = input
            ? procedureInstance.input(input)
            : procedureInstance;
        const procedureWithOutput = output
            ? procedureWithInput.output(output)
            : procedureWithInput;
        const procedureInvocation = (opts) => {
            return routerInstance[procedureName](...this.serializeProcedureParams(opts, params));
        };
        return type === ProcedureType.Mutation
            ? procedureWithOutput.mutation(procedureInvocation)
            : procedureWithOutput.query(procedureInvocation);
    }
};
__decorate([
    Inject(ConsoleLogger),
    __metadata("design:type", ConsoleLogger)
], ProcedureFactory.prototype, "consoleLogger", void 0);
__decorate([
    Inject(MetadataScanner),
    __metadata("design:type", MetadataScanner)
], ProcedureFactory.prototype, "metadataScanner", void 0);
ProcedureFactory = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ModuleRef])
], ProcedureFactory);
export { ProcedureFactory };
//# sourceMappingURL=procedure.factory.js.map