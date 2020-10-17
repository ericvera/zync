// Libs
import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { createCheckers } from 'ts-interface-checker'
// Helpers
import configTi from './config-ti'
import { err } from './console'

interface ZyncPair {
  source: string
  destination: string
}

interface ZyncInfo {
  source: string
  sourceFiles: string[]
  destination: string
  destinationFiles: string[]
}

interface ZyncProjectConfig {
  name: string
  baseDestinationPath: string
  paths: ZyncPair[]
}

interface ZyncConfig {
  projects: ZyncProjectConfig[]
  baseSourcePath: string
}

const ConfigFileName = 'zync.config.json'

export const getConfigPath = async (): Promise<string> => {
  let currentPath = ''
  let currentConfigFilePath = ''

  do {
    currentPath = path.dirname(currentPath || path.resolve('./'))
    currentConfigFilePath = `${currentPath}/${ConfigFileName}`

    if (await fse.pathExists(currentConfigFilePath)) {
      return currentConfigFilePath
    }
  } while (currentPath !== '/')

  err(
    `'${ConfigFileName}' not found in the current directory '${path.resolve(
      './'
    )}' or any of its parents.`
  )

  return ''
}

const validateConfig = async (config: ZyncConfig) => {
  const { ZyncConfig } = createCheckers(configTi)

  ZyncConfig.strictCheck(config)

  if (!fse.pathExists(config.baseSourcePath)) {
    err(`'baseSourcePath' '${config.baseSourcePath}' does not exist.`)
  }

  if (!config.projects || config.projects.length < 1) {
    err(`'projects' missing from '${ConfigFileName}'`)
  }
}

const getConfig = async (configPath: string): Promise<ZyncConfig> => {
  let config: ZyncConfig

  try {
    config = (await fse.readJSON(configPath)) as ZyncConfig
  } catch (error) {
    if (error.name === 'SyntaxError') {
      err(`Malformed JSON file at ${configPath}`)
    } else {
      err(`Unknown error on path ${configPath}\n`, error)
    }

    process.exit(1)
  }

  await validateConfig(config)

  return config
}

/**
 *
 * @param project If provided only get the paths for the specified project,
 *          otherwise provide for all.
 */
export const getSyncPaths = async (
  configPath: string,
  project: string | undefined = undefined
) => {
  const configPathDir = path.dirname(configPath)

  console.log(`Config: ${configPath}`)

  const config = await getConfig(configPath)

  let projects = config.projects

  if (project) {
    projects = projects.filter((proj) => proj.name === project)
  }

  let paths: ZyncInfo[] = []

  const baseSourcePath = path.join(configPathDir, config.baseSourcePath)

  // Get array of paths (source and destination)
  for (const proj of projects) {
    for (const pathPair of proj.paths) {
      const source = path.join(baseSourcePath, pathPair.source)

      const destination = path.join(
        configPathDir,
        proj.baseDestinationPath,
        pathPair.destination
      )

      if (!(await fse.pathExists(source))) {
        err(
          `source path '${source}' in project '${proj.name}' does not exist and it must exist before being used.`
        )
      }

      if (!(await fse.pathExists(destination))) {
        err(
          `destination path '${destination}' in project '${proj.name}' does not exist and it must exist before being used.`
        )
      }

      paths.push({
        source,
        destination,
        sourceFiles: await globby('**/*', {
          cwd: source,
        }),
        destinationFiles: await globby('**/*', {
          cwd: destination,
        }),
      })
    }
  }

  return paths
}
