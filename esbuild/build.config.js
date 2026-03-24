const path = require('path')
const fg = require('fast-glob')

/**
 * Configuration for build steps
 */
const getBuildConfig = () => {
  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'
  const isWatchMode = process.argv.includes('--watch')

  return {
    isProduction,
    isWatchMode,

    app: {
      outDir: path.join(cwd, 'dist'),
      entryPoints: fg.sync([`${cwd}/*.ts`, `${cwd}/server/**/*.ts`], {
        ignore: ['**/*.test.ts', '**/*.config.ts'],
      }),
      copy: [{ from: `${cwd}/server/views/**/*`, to: `${cwd}/dist/server/views` }],
    },

    assets: {
      outDir: path.join(cwd, 'dist/assets'),
      entryPoints: fg.sync([`${cwd}/assets/js/*.js`, `${cwd}/assets/scss/*.scss`, `${cwd}/assets/content/*.json`]),
      copy: [
        { from: `${cwd}/assets/images/**/*`, to: `${cwd}/dist/assets/images` },
        { from: `${cwd}/assets/content/**/*`, to: `${cwd}/dist/assets/content` },
      ],
      clear: fg.sync([`${cwd}/dist/assets/{css,js,json}`]),
    },
  }
}

module.exports = { getBuildConfig }
