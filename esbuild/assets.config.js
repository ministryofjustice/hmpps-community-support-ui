const path = require('node:path')
const { copy } = require('esbuild-plugin-copy')
const { sassPlugin } = require('esbuild-sass-plugin')
const { clean } = require('esbuild-plugin-clean')
const manifestPlugin = require('esbuild-plugin-manifest')
const fg = require('fast-glob')
const { buildNotificationPlugin } = require('./utils')

const getAdditionalAssetsConfig = buildConfig => ({
  outdir: buildConfig.assets.outDir,
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: buildConfig.assets.copy,
    }),
    buildNotificationPlugin('Assets (Additional)', buildConfig.isWatchMode),
  ],
})

const getAssetsConfig = buildConfig => ({
  entryPoints: buildConfig.assets.entryPoints,
  outdir: buildConfig.assets.outDir,
  entryNames: '[ext]/[name].[hash]',
  minify: buildConfig.isProduction,
  sourcemap: !buildConfig.isProduction,
  platform: 'browser',
  target: 'es2018',
  external: ['/assets/*'],
  bundle: true,
  plugins: [
    clean({
      patterns: fg.sync(buildConfig.assets.clear),
    }),
    manifestPlugin({
      generate: entries =>
        Object.fromEntries(Object.entries(entries).map(paths => paths.map(p => p.replace(/^dist\//, '/')))),
    }),
    sassPlugin({
      quietDeps: true,
      loadPaths: [process.cwd(), path.join(process.cwd(), 'node_modules')],
    }),
    buildNotificationPlugin('Assets', buildConfig.isWatchMode),
  ],
})

module.exports = { getAssetsConfig, getAdditionalAssetsConfig }
