const { spawnPrefixed } = require('./utils')

/**
 * Server process management with proper race condition handling
 */
class ServerManager {
  constructor(options = {}) {
    this.serverProcess = null
    this.options = {
      label: 'Node',
      color: 'green',
      ...options,
    }
  }

  /**
   * Start or restart the server
   * Properly handles race conditions by waiting for old process to exit
   */
  async restart() {
    if (this.serverProcess) {
      // Check if process is still alive before waiting for exit
      const isAlive = this.serverProcess.exitCode === null && this.serverProcess.signalCode === null

      if (isAlive) {
        await new Promise(resolve => {
          this.serverProcess.once('exit', resolve)
          this.serverProcess.kill()
        })
      }

      this.serverProcess = null
    }

    const nodeArgs = [
      ...(this.options.envFile ? [`--env-file=${this.options.envFile}`] : []),
      '--enable-source-maps',
      'dist/server.js',
    ]

    this.serverProcess = spawnPrefixed('node', nodeArgs, {
      label: this.options.label,
      color: this.options.color,
    })
  }
}

module.exports = ServerManager
