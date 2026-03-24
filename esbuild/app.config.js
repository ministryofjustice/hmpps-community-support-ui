const { copy } = require('esbuild-plugin-copy')
const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck')
const fg = require('fast-glob')
const { buildNotificationPlugin } = require('./utils')

/**
 * Build typescript application into CommonJS
 */
const getAppConfig = buildConfig => ({
  entryPoints: fg.sync(buildConfig.app.entryPoints),
  outdir: buildConfig.app.outDir,
  bundle: false,
  sourcemap: true,
  platform: 'node',
  format: 'cjs',
  plugins: [
    typecheckPlugin({ watch: buildConfig.isWatchMode }),
    copy({
      resolveFrom: 'cwd',
      assets: buildConfig.app.copy,
    }),
    buildNotificationPlugin('App', buildConfig.isWatchMode),
  ],
})

module.exports = { getAppConfig }
