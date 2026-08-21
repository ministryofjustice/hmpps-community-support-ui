import { defineConfig } from 'eslint/config'
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default defineConfig([
  {
    files: ['**/*.ts'],
    ignores: ['**/*.js'],
    extends: [hmppsConfig()],
    rules: {
      'sort-keys': ['error', 'asc'],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          interfaces: {
            order: 'as-written',
            optionalityOrder: 'required-first',
          },
          typeLiterals: {
            order: 'as-written',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
  },
  {
    files: ['eslint*.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
])
