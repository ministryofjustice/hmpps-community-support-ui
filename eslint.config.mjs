import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig(),
  {
    files: ['eslint*.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
]
