import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import configPrettier from 'eslint-config-prettier';

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
	features: {
		// Rules for module authors
		tooling: true,
		// Rules for formatting
		stylistic: false,
	},
	dirs: {
		src: ['./playground'],
	},
}).append(configPrettier);
