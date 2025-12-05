#!/usr/bin/env node
const { program } = require('commander')
const { version } = require('../package.json')
const checkUpdate = require('./utils/checkUpdate.js')
const init = require('./utils/init.js')
const deploy = require('./utils/deploy.js')
const runBuild = require('./utils/runBuild.js')
const showConfig = require('./utils/showConfig.js')
const resetConfig = require('./utils/resetConfig.js')

async function main() {
  // 版本检测
  await checkUpdate()
  // 配置版本号
  program.version(version, '-v, --version', 'output the current version')

  // 配置子命令
  program
    .command('create <control-name>')
    .description('create a new project')
    .option('-s, --source <source>', 'specified repository source', 'outer')
    .action((name, opts) => {
      init(name, opts)
    })

  program
    .command('deploy')
    .description('deploy project')
    .option('-f, --force', 'force deploy, ignore warnings')
    .action((options) => {
      deploy(options)
    })

  program
    .command('build')
    .description('build project')
    .action(() => {
      runBuild()
    })

  // 创建 config 父命令
  const configCmd = program.command('config').description('configuration-related commands')

  configCmd
    .command('show')
    .description('show config')
    .option('-l, --local', 'local project')
    .action((options) => {
      showConfig(options)
    })

  configCmd
    .command('reset')
    .description('reset config')
    .option('-l, --local', 'local project')
    .action((options) => {
      resetConfig(options)
    })

  // config show
  // 解析用户传入的参数
  program.parse(process.argv)

}

main()