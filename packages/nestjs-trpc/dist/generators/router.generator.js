import { __decorate, __metadata } from "tslib";
import { DecoratorGenerator } from './decorator.generator';
import { Inject, Injectable } from '@nestjs/common';
import { camelCase } from 'lodash';
import { ProcedureGenerator } from './procedure.generator';
let RouterGenerator = class RouterGenerator {
    serializeRouters(routers, project) {
        return routers.map((router) => {
            const proceduresMetadata = router.procedures.map((procedure) => this.serializeRouterProcedures(router.path, procedure, router.name, project));
            return {
                name: router.name,
                alias: router.alias,
                procedures: proceduresMetadata,
            };
        });
    }
    serializeRouterProcedures(routerFilePath, procedure, routerName, project) {
        const sourceFile = project.addSourceFileAtPath(routerFilePath);
        const classDeclaration = sourceFile.getClass(routerName);
        if (!classDeclaration) {
            throw new Error(`Could not find router ${routerName} class declaration.`);
        }
        const methodDeclaration = classDeclaration.getMethod(procedure.name);
        if (!methodDeclaration) {
            throw new Error(`Could not find ${routerName}, method declarations.`);
        }
        const decorators = methodDeclaration.getDecorators();
        if (!decorators) {
            throw new Error(`could not find ${methodDeclaration.getName()}, method decorators.`);
        }
        const serializedDecorators = this.decoratorHandler.serializeProcedureDecorators(decorators, sourceFile, project);
        return {
            name: procedure.name,
            decorators: serializedDecorators,
        };
    }
    generateRoutersStringFromMetadata(routers) {
        return routers
            .map((router) => {
            const { name, procedures, alias } = router;
            return `${alias ?? camelCase(name)}: t.router({ ${procedures
                .map(this.procedureGenerator.generateProcedureString)
                .join(',\n')} })`;
        })
            .join(',\n');
    }
};
__decorate([
    Inject(DecoratorGenerator),
    __metadata("design:type", DecoratorGenerator)
], RouterGenerator.prototype, "decoratorHandler", void 0);
__decorate([
    Inject(ProcedureGenerator),
    __metadata("design:type", ProcedureGenerator)
], RouterGenerator.prototype, "procedureGenerator", void 0);
RouterGenerator = __decorate([
    Injectable()
], RouterGenerator);
export { RouterGenerator };
//# sourceMappingURL=router.generator.js.map