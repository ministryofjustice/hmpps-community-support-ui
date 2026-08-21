export default {
  '*.{ts,js,mjs,css}': ['prettier --write', 'eslint --config eslint.staged.config.mjs --max-warnings 0 --fix'],
  '*.json': ['prettier --write'],
}
