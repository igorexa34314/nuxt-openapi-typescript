import { defineNuxtModule, addTypeTemplate, findPath, logger } from '@nuxt/kit';
import openapiTS, { astToString } from 'openapi-typescript';
import { isUri } from './utils/validate-url';

// Module options TypeScript interface definition
export interface ModuleOptions {
	schemaPath: string;
	moduleName: string;
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: 'nuxt-openapi-typescript',
		configKey: 'openapiTypescript',
	},
	// Default configuration options of the Nuxt module
	defaults: {
		schemaPath: './openapi/schema.json',
		moduleName: 'openapi-schema-generated',
	},
	async setup(options) {
		let schemaPath: URL;
		let localPath: string | null = null;

		try {
			localPath = await findPath(options.schemaPath);
		} catch {
			localPath = null;
		}

		if (localPath) {
			schemaPath = new URL(localPath);
		} else if (isUri(options.schemaPath)) {
			console.log(isUri(options.schemaPath));

			schemaPath = new URL(options.schemaPath);
		} else {
			logger.error(`Invalid schema path: ${options.schemaPath}`);
			return;
		}

		try {
			const ast = await openapiTS(schemaPath, {
				pathParamsAsTypes: true,
			});

			const contents = astToString(ast, {});

			addTypeTemplate({
				filename: 'types/openapi-schema.d.ts',
				getContents: () => {
					return `module '${options.moduleName}' {
${contents
	.split('\n')
	.map(line => '  ' + line)
	.join('\n')}
  /* Manually added OpenAPI schema utils */
  // Schema Obj
  export type Schema<T extends keyof components['schemas']> = components['schemas'][T];
  export type SchemaId<T extends keyof components['schemas']> =
    Schema<T> extends { id?: infer I } ? NonNullable<I> : string;
  // Path query params
  export type QueryParams<P extends keyof paths, M extends keyof paths[P] = 'get'> = paths[P][M] extends {
    parameters: infer P;
  }
    ? P extends { query?: infer Q }
      ? Q extends undefined
        ? { [key: string]: any }
        : Q & { [key: string]: any }
      : Record<string, any>
    : Record<string, any>;

  export {}
}`;
				},
			});

			logger.success(`Successfully generated OpenAPI schema from ${options.schemaPath}`);
		} catch (error) {
			logger.error(`The provided file is not a valid OpenAPI v3 schema`);
			console.error((error as Error)?.message);
			return;
		}
	},
});
