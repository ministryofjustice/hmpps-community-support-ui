const path = require('node:path')
const { getBuildConfig } = require('../esbuild/build.config')

describe('application build configuration', () => {
  it('compiles the content module used by referral navigation', () => {
    const config = getBuildConfig()

    expect(config.app.entryPoints).toContain(path.join(process.cwd(), 'assets/content/GlobalContent.ts'))
    expect(config.app.outDir).toBe(path.join(process.cwd(), 'dist'))
  })
})
