import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import { err } from './console'

const SharedFileMark = '// [SHARED FILE WARNING]:'

export const getSharedFileWarning = (sourcePath: string) =>
  `${SharedFileMark} To modify this file change the original at '${sourcePath}' and run the shared script to deploy.\n`

const getFilesInANotInB = async (a: string[], b: string[]) =>
  a.filter((x) => !b.includes(x))

const getFileHash = async (
  filePath: string,
  isSharedFile: boolean = false
): Promise<string> => {
  let content = await fs.readFileSync(filePath, 'utf8')

  if (isSharedFile && !content.startsWith(SharedFileMark)) {
    err(
      `${filePath} is expected to begin with ${SharedFileMark}, but it didn't. Run 'zync' to syncronize files.`
    )
    return ''
  }

  if (isSharedFile) {
    content = content.replace(/^(.*\n){1}/g, '')
  }

  return crypto.createHash('md5').update(content).digest('hex')
}

export const validateNoFilesInAAndNotInB = async (
  a: string[],
  aName: string,
  aBasePath: string,
  b: string[],
  bName: string
) => {
  const inAButNotB = await getFilesInANotInB(a, b)

  if (inAButNotB && inAButNotB.length > 0) {
    // Add base path so that they are easier to find
    const onlyInAWithBasePath = inAButNotB.map((x) => path.join(aBasePath, x))

    err(
      `The following files exist in ${aName}, but not in ${bName}. [${onlyInAWithBasePath.join(
        ', '
      )}]`
    )
  }
}

export const validateHashesMatch = async (
  source: string,
  sourceFiles: string[],
  destination: string,
  destinationFiles: string[]
) => {
  if (
    !sourceFiles ||
    !destinationFiles ||
    sourceFiles.length !== destinationFiles.length
  ) {
    err(
      `sourceFiles and destinationFiles should be matching in order to validate hashes. (source: ${source} / destination: ${destination})`
    )
    return
  }

  const sourceHashes = await Promise.all(
    sourceFiles.map((sourceFile) => getFileHash(path.join(source, sourceFile)))
  )
  const destinationHashes = await Promise.all(
    destinationFiles.map((destinationFile) =>
      getFileHash(path.join(destination, destinationFile), true)
    )
  )

  for (let i = 0; i < sourceHashes.length; i++) {
    if (sourceHashes[i] !== destinationHashes[i]) {
      err(
        `Hash of files ${sourceFiles[i]} (${sourceHashes[i]}) and ${destinationFiles[i]} (${destinationHashes[i]}) do not match. To sync the files run 'zync' on your shared files.`
      )
    }
  }
}
