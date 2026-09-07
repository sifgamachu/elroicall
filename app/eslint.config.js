import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    // Generated/legacy UI that is not in the current production route graph.
    // These are tracked for removal or modernization during the design-system migration.
    'src/components/ui/badge.tsx',
    'src/components/ui/button-group.tsx',
    'src/components/ui/button.tsx',
    'src/components/ui/carousel.tsx',
    'src/components/ui/form.tsx',
    'src/components/ui/navigation-menu.tsx',
    'src/components/ui/sidebar.tsx',
    'src/components/ui/toggle.tsx',
    'src/hooks/use-mobile.ts',
    'src/sections/CallSample.tsx',
    'src/sections/Voices.tsx',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
