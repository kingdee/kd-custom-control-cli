// src/utils/runCommand.js

const { spawn } = require('child_process')
const chalk = require('chalk')

/**
 * 封装 child_process.spawn 来执行更新命令
 * @param {string} command - 要执行的命令 (e.g., 'npm')
 * @param {string[]} args - 命令参数 (e.g., ['install', '-g', 'kd-cli'])
 */
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        // 使用 { stdio: 'inherit' } 让子进程的输出直接显示在主控制台
        const child = spawn(command, args, { 
            stdio: 'inherit',
            shell: true // 确保跨平台兼容性
        })

        child.on('error', (err) => {
            reject(new Error(`命令执行失败: ${err.message}`))
        })

        child.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`命令执行失败，退出码: ${code}`))
            }
        })
    })
}

/**
 * 执行 kd-cli 的自动更新
 */
async function autoUpdate(packageName, latestVersion) {
    const installCmd = 'npm'
    // 默认使用 npm install -g <pkg>@<version>
    const installArgs = ['install', '-g', `${packageName}@${latestVersion}`]

    console.log(chalk.yellow(`\n正在自动更新 ${packageName}...`))
    console.log(chalk.gray(`> ${installCmd} ${installArgs.join(' ')}`))

    try {
        await runCommand(installCmd, installArgs)
        
        console.log(chalk.green(`\n🎉 ${packageName} 成功更新到 ${latestVersion}。请重新运行脚手架。`))
        
        // **关键步骤：** 更新后退出进程
        process.exit(0) 
    } catch (error) {
        console.error(chalk.red(`\n自动更新失败:`))
        console.error(error.message)
        console.log(chalk.cyan(`\n请尝试手动更新: npm install -g ${packageName}`))
    }
}

module.exports = { 
    runCommand,
    autoUpdate 
}