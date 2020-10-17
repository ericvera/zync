import chalk from 'chalk'

export const warn = (text: string, ...rest: unknown[]) =>
  console.log(chalk.black.bgKeyword('orange')(text), ...rest)

export const err = (text: string, ...rest: unknown[]) => {
  console.log(chalk.black.bgRed(text), ...rest)
  process.exit(1)
}

export const success = (text: string, ...rest: unknown[]) =>
  console.log(chalk.black.bgGreen(text), ...rest)

export const log = console.log
