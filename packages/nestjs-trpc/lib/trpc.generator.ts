import * as path from 'node:path';
import {
  ProcedureFactoryMetadata,
  RoutersFactoryMetadata,
} from './interfaces/factory.interface';
import { locate } from 'func-loc';
import {
  ConsoleLogger,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { camelCase } from 'lodash';

import {
  CompilerOptions,
  Decorator,
  Expression,
  ModuleKind,
  Project,
  ScriptTarget,
  SourceFile,
  StructureKind,
  SyntaxKind,
  Node,
  VariableDeclarationKind,
} from 'ts-morph';
import {
  DecoratorGeneratorMetadata,
  ProcedureGeneratorMetadata,
  RouterGeneratorMetadata,
} from './interfaces/generator.interface';

interface SchemaMap {
  initializer: Expression;
  sourceFile: SourceFile;
}

@Injectable()
export class TRPCGenerator implements OnModuleInit {
  private project: Project;
  private readonly OUTPUT_FILE_NAME = 'trpc.ts';

  constructor(
    @Inject(ConsoleLogger) private readonly consoleLogger: ConsoleLogger,
  ) {}

  onModuleInit() {
    const defaultCompilerOptions: CompilerOptions = {
      target: ScriptTarget.ES2019,
      module: ModuleKind.CommonJS,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      esModuleInterop: true,
    };

    this.project = new Project({
      compilerOptions: {
        ...defaultCompilerOptions,
      },
    });
  }

  public async generate(
    routers: Array<RoutersFactoryMetadata>,
    outputDirPath: string,
  ): Promise<void> {
    try {
      const trpcSourceFile = this.project.createSourceFile(
        path.resolve(outputDirPath, this.OUTPUT_FILE_NAME),
        undefined,
        { overwrite: true },
      );

      this.generateStaticDeclaration(trpcSourceFile);

      const routersMetadata = await this.serializeRouters(routers);
      const routersStringDeclarations =
        this.generateRoutersStringFromMetadata(routersMetadata);

      trpcSourceFile.addStatements(/* ts */ `
          const appRouter = t.router({${routersStringDeclarations}});
          export type AppRouter = typeof appRouter;
          `);

      this.saveOrOverrideFile(trpcSourceFile);

      this.consoleLogger.log(
        `TRPC AppRouter has been updated successfully at "${outputDirPath}/${this.OUTPUT_FILE_NAME}".`,
      );
    } catch (e: unknown) {
      console.error(e);
      this.consoleLogger.warn('TRPC Generator encountered an error.', e);
    }
  }

  private generateRoutersStringFromMetadata(
    routers: Array<RouterGeneratorMetadata>,
  ): string {
    return routers
      .map((router) => {
        const { name, procedures } = router;
        return `${camelCase(name)}: { ${procedures
          .map((procedure) => {
            const { name, decorators } = procedure;

            const decorator = decorators.find(
              (decorator) =>
                decorator.name === 'Mutation' || decorator.name === 'Query',
            );

            if (decorator == null) {
              return '';
            }

            const decoratorArgumentsArray = Object.entries(decorator.arguments)
              .map(([key, value]) => `.${key}(${value})`)
              .join('');

            return `${name}: publicProcedure${decoratorArgumentsArray}.${decorator.name.toLowerCase()}(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )`;
          })
          .join(',\n')} }`;
      })
      .join(',\n');
  }

  private async serializeRouters(
    routers: Array<RoutersFactoryMetadata>,
  ): Promise<Array<RouterGeneratorMetadata>> {
    return await Promise.all(
      routers.map(async (router) => {
        const proceduresMetadata = await Promise.all(
          router.procedures.map(async (procedure) =>
            this.serializeRouterProcedures(procedure, router.name),
          ),
        );

        return {
          name: router.name,
          procedures: proceduresMetadata,
        };
      }),
    );
  }

  private async serializeRouterProcedures(
    procedure: ProcedureFactoryMetadata,
    routerName: string,
  ): Promise<ProcedureGeneratorMetadata> {
    const location = await locate(procedure.implementation, {
      sourceMap: true,
    });
    const sourceFile = this.project.addSourceFileAtPath(location.path);

    const classDeclaration = sourceFile.getClass(routerName);
    if (classDeclaration == null) {
      throw new Error(
        `Could not find router ${routerName}, class declaration.`,
      );
    }

    const methodDeclaration = classDeclaration.getMethod(procedure.name);
    if (methodDeclaration == null) {
      throw new Error(`Could not find ${routerName}, method declarations.`);
    }

    const decorators = methodDeclaration.getDecorators();
    if (decorators == null) {
      throw new Error(
        `could not find ${methodDeclaration.getName()}, method decorators.`,
      );
    }
    return {
      name: procedure.name,
      decorators: this.serializeProcedureDecorators(decorators, sourceFile),
    };
  }

  private serializeProcedureDecorators(
    decorators: Array<Decorator>,
    sourceFile: SourceFile,
  ): Array<DecoratorGeneratorMetadata> {
    const decoratorsMetadata: Array<DecoratorGeneratorMetadata> =
      decorators.reduce<Array<DecoratorGeneratorMetadata>>(
        (array, decorator) => {
          const decoratorName = decorator.getName();

          if (decoratorName === 'Query' || decoratorName === 'Mutation') {
            const input = this.getDecoratorPropertyValue(
              decorator,
              'input',
              sourceFile,
            );
            const output = this.getDecoratorPropertyValue(
              decorator,
              'output',
              sourceFile,
            );
            array.push({
              name: decoratorName,
              arguments: {
                ...(input != null ? { input } : {}),
                ...(output != null ? { output } : {}),
              },
            });
          } else {
            this.consoleLogger.warn(
              `Decorator ${decoratorName}, not supported.`,
            );
          }
          return array;
        },
        [],
      );

    return decoratorsMetadata;
  }

  private getDecoratorPropertyValue(
    decorator: Decorator,
    propertyName: string,
    sourceFile: SourceFile,
  ): string | null {
    const args = decorator.getArguments();
    for (const arg of args) {
      if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
        /* @ts-ignore (This is available in rune-time, I don't know why it isn't asserting the type correctly.) */
        const properties = arg.getProperties();
        const property = properties.find(
          (property) => property.getName() === propertyName,
        );

        if (property == null) {
          return null;
        }

        const propertyInitializer: Expression = property.getInitializer();

        const schemaMap = this.buildSchemaMap(sourceFile);
        const test = this.flattenZodSchema(
          propertyInitializer,
          sourceFile,
          schemaMap,
          propertyInitializer.getText(),
        );
        return test;
      }
    }
    return null;
  }

  private generateStaticDeclaration(sourceFile: SourceFile): void {
    sourceFile.addImportDeclaration({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@trpc/server',
      namedImports: ['initTRPC'],
    });
    sourceFile.addImportDeclaration({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: 'zod',
      namedImports: ['z'],
    });

    sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 't', initializer: 'initTRPC.create()' }],
      },
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 'publicProcedure', initializer: 't.procedure' }],
      },
    ]);
  }

  private async saveOrOverrideFile(sourceFile: SourceFile): Promise<void> {
    sourceFile.formatText({
      indentSize: 2,
    });

    await sourceFile.save();
  }

  private flattenZodSchema(
    node: Node,
    sourceFile: SourceFile,
    schemaMap: Map<string, SchemaMap>,
    schema: string,
  ): string {
    if (Node.isIdentifier(node)) {
      const identifierName = node.getText();

      const identifierDeclaration =
        sourceFile.getVariableDeclaration(identifierName);

      if (identifierDeclaration != null) {
        const identifierInitializer = identifierDeclaration.getInitializer();

        const identifierSchema = this.flattenZodSchema(
          identifierInitializer,
          sourceFile,
          schemaMap,
          identifierInitializer.getText(),
        );

        schema = schema.replace(identifierName, identifierSchema);
      } else if (schemaMap.has(identifierName)) {
        const importedIdentifier = schemaMap.get(schema);
        const { initializer } = importedIdentifier;
        const identifierSchema = this.flattenZodSchema(
          initializer,
          importedIdentifier.sourceFile,
          schemaMap,
          initializer.getText(),
        );

        schema = schema.replace(identifierName, identifierSchema);
      }
    } else if (Node.isObjectLiteralExpression(node)) {
      for (const property of node.getProperties()) {
        if (Node.isPropertyAssignment(property)) {
          const propertyText = property.getText();
          schema = schema.replace(
            propertyText,
            this.flattenZodSchema(
              property.getInitializer(),
              sourceFile,
              schemaMap,
              propertyText,
            ),
          );
        }
      }
    } else if (Node.isArrayLiteralExpression(node)) {
      for (const element of node.getElements()) {
        const elementText = element.getText();
        schema = schema.replace(
          elementText,
          this.flattenZodSchema(element, sourceFile, schemaMap, elementText),
        );
      }
    } else if (Node.isCallExpression(node)) {
      for (const arg of node.getArguments()) {
        const argText = arg.getText();
        schema = schema.replace(
          argText,
          this.flattenZodSchema(arg, sourceFile, schemaMap, argText),
        );
      }
    } else if (Node.isPropertyAccessExpression(node)) {
      schema = this.flattenZodSchema(
        node.getExpression(),
        sourceFile,
        schemaMap,
        schema,
      );
    }

    return schema;
  }

  private buildSchemaMap(sourceFile: SourceFile): Map<string, SchemaMap> {
    const schemaMap = new Map<string, SchemaMap>();
    const project = sourceFile.getProject();

    // Process all the import declarations
    const importDeclarations = sourceFile.getImportDeclarations();
    for (const importDeclaration of importDeclarations) {
      const namedImports = importDeclaration.getNamedImports();
      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
        const resolvedPath = path.resolve(
          path.dirname(sourceFile.getFilePath()),
          moduleSpecifier + '.ts',
        );

        const importedSourceFile =
          project.addSourceFileAtPathIfExists(resolvedPath);
        if (!importedSourceFile) continue;

        const schemaVariable = importedSourceFile.getVariableDeclaration(name);

        if (schemaVariable != null) {
          const initializer = schemaVariable.getInitializer();
          if (initializer != null) {
            schemaMap.set(name, {
              initializer,
              sourceFile: importedSourceFile,
            });
          }
        }
      }
    }

    return schemaMap;
  }
}
