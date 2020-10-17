import { watch } from 'chokidar'
import fse from 'fs-extra'
import * as fsPath from 'path'
import { getConfigPath, getSyncPaths } from '../helpers/config'
// Helpers
import { log, success, warn } from '../helpers/console'
import {
  getSharedFileWarning,
  validateNoFilesInAAndNotInB,
} from '../helpers/files'

const syncedFileChanged = (sourceDir: string, destinationDir: string) => async (
  event: string,
  changedPath: string
) => {
  // Read file
  let content = await fse.readFile(changedPath, 'utf8')

  // Add signature to top
  content = getSharedFileWarning(changedPath) + content

  // Write out content to destination folder
  const pathInfo = fsPath.parse(changedPath)

  const destinationChangeDir = pathInfo.dir.substr(sourceDir.length)

  const destPath = fsPath.join(
    destinationDir,
    destinationChangeDir,
    `${pathInfo.name}${pathInfo.ext}`
  )

  await fse.outputFile(destPath, content)

  success(`[UPDATED] ${destPath} (from ${changedPath})`)
}

const configFileChanged = (event: string, configPath: string) => {
  if (event !== 'add') {
    warn(
      `Config file (${configPath}) is being changed which can cause unintended file creation/removal. Restart Zync once you are done with the changes.`
    )
    process.exit(1)
  }
}

const zync = async () => {
  const configPath = await getConfigPath()

  // Monitor config for changes and exit if changed to avoid transcient copies
  const configFileWatcher = watch(configPath)
  configFileWatcher.on('all', configFileChanged)

  // Read paths from config
  const syncPaths = await getSyncPaths(configPath)

  log('Zyncing (use CTRL+C to exit)...\n')

  // Check if there are any files in destination that are not in source (extraneous)
  // NOTE: Show error and exit instead of just delete to avoid deleting files from the
  // user without them knowing.
  for (const filePath of syncPaths) {
    await validateNoFilesInAAndNotInB(
      filePath.destinationFiles,
      'destination',

      filePath.destination,
      filePath.sourceFiles,
      'source'
    )
  }

  // Monitor all source globs and copy on any changes
  syncPaths.forEach((syncPath) => {
    const watcher = watch(`${syncPath.source}/**/*.*`)
    watcher.on('all', syncedFileChanged(syncPath.source, syncPath.destination))
  })
}

export default zync
