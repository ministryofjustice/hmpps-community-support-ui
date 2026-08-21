const { ESBuildManager, getEnvFile } = require('./utils')
const ServerManager = require('./serverManager')

function main() {
  const args = process.argv
  const isWatchMode = args.includes('--watch')
  const envFile = getEnvFile(args)

  const serverManager = new ServerManager({
    envFile,
  })
  const esbuildManager = new ESBuildManager({
    onBuildComplete: () => serverManager.restart(),
  })

  esbuildManager.start(isWatchMode)
}

main()
