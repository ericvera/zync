import { getConfigPath, getSyncPaths } from '../helpers/config'
import { success } from '../helpers/console'
import {
  validateHashesMatch,
  validateNoFilesInAAndNotInB,
} from '../helpers/files'

/**
 *
 * @param project If provided only check the paths for the specified project,
 *          otherwise check all.
 */
const check = async (project: string | undefined = undefined) => {
  console.log(
    `Zync is checking ${project ? `project ${project}` : 'all projects'}...\n`
  )

  const configPath = await getConfigPath()

  const paths = await getSyncPaths(configPath, project)

  // Check if there are any files in destination that are not in source (extraneous)
  // NOTE: Show error and exit instead of just delete to avoid deleting files from the
  // user without them knowing.
  for (const filePath of paths) {
    await validateNoFilesInAAndNotInB(
      filePath.destinationFiles,
      'destination',
      filePath.destination,
      filePath.sourceFiles,
      'source'
    )
  }

  // Check if there are any files in source that are not in destination (missing)
  for (const filePath of paths) {
    await validateNoFilesInAAndNotInB(
      filePath.sourceFiles,
      'source',
      filePath.source,
      filePath.destinationFiles,
      'destination'
    )
  }

  // Check that the hashed match
  for (const filePath of paths) {
    await validateHashesMatch(
      filePath.source,
      filePath.sourceFiles,
      filePath.destination,
      filePath.destinationFiles
    )
  }

  success('All files match!')
}

export default check
