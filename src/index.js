#!/usr/bin/env node
const { program } = require('commander')
const { version } = require('../package.json')
const init = require('./utils/init.js')
// 配置版本号
program.version(version, '-v, --version', 'output the current version')

// 配置子命令
program
  .command('create <control-name>')
  .description('create a new project')
  .action((name) => {
    init(name)
  })

// 解析用户传入的参数
program.parse(process.argv)