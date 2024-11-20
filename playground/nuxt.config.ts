export default defineNuxtConfig({
	modules: ['../src/module'],

	openapiTypescript: {
		schemaPath: './sgdfgdfgdi/schema.json',
	},

	devtools: { enabled: true },
	compatibilityDate: '2024-11-20',
});
