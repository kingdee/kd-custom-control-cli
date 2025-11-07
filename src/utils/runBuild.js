const fs = require('fs')
const path = require('path')
const ora = require('ora')
const { spawn } = require('child_process')
const installSpiner = ora('依赖安装中')
const { error, success } = require('./log.js')

/**
 * 在指定目录执行 shell 命令
 * @param {string} command - 主命令（如 npm）
 * @param {string[]} args - 参数（如 ['install']）
 * @param {string} cwd - 执行目录
 * @returns {Promise<void>}
 */
function runCommand (command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: args[0] === 'install' ? ['ignore', 'ignore', 'inherit'] : 'inherit',
      shell: true
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} 失败，退出码 ${code}`))
      }
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * 自动检测依赖并构建项目
 * @param {string} cwd - 构建目录（默认当前工作目录）
 * @returns {Promise<void>}
 */
async function runBuild (cwd = process.cwd()) {
  const nodeModulesPath = path.join(cwd, 'node_modules')
  const packageJsonPath = path.join(cwd, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    error('❌ 当前目录未检测到 package.json，无法执行构建。')
    return
  }

  try {
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 检测到缺少 node_modules，正在执行 npm install...')
      installSpiner.start()
      await runCommand('npm', ['install'], cwd)
      installSpiner.stop()
      success('✅ 依赖安装完成')
    }

    await runCommand('npm', ['run', 'build:silent', '--silent'], cwd)
    success('✅ 构建完成')
  } catch (err) {
    error(`❌ 构建流程出错: ${err.message}`)
    throw err
  }
}

module.exports = runBuild