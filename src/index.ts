#!/usr/bin/env node
// Libs
import chalk from 'chalk'
import figlet from 'figlet'
import { program } from 'commander'
// Commands
import zync from './commands/zync'
import check from './commands/check'

console.log(
  chalk.green(figlet.textSync('-- Zync :) --', { horizontalLayout: 'full' })),
  '\n'
)

console.log(
  chalk.green('                  Keep shared files in sync across a project.\n')
)

program
  .version('0.0.1')
  .description('A CLI to keep shared files in a project in sync.')

program.command('zync', { isDefault: true }).action(() => {
  zync()
})

program
  .command('check [project]')
  .action((project: string | undefined = undefined) => {
    check(project)
  })

// Start
;(async () => {
  await program.parseAsync(process.argv)
})()
