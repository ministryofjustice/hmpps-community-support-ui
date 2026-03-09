import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.6': 'ALLOW',
    // Provides native integration, supporting ability to write dtrace probes for bunyan
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    // ESBuild is written in GoLang - this is needed to download prebuilt binaries for the specific platform
    'node_modules/esbuild@0.27.3': 'ALLOW',
    // Needed by jest for running tests in watch mode
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Same as above, bust nested
    'node_modules/playwright/node_modules/fsevents@2.3.2': 'ALLOW',
    // Native bindings for ESBuild: https://github.com/unrs/unrs-resolver/issues/56
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})
