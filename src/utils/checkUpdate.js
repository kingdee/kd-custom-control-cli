// src/utils/checkUpdate.js

const updateNotifier = require('update-notifier').default || require('update-notifier')
const { safePrompts } = require('./prompts')
const chalk = require('chalk')
const pkg = require('../../package.json')
const { autoUpdate } = require('./runCommand') // 引入 autoUpdate 函数

/**
 * 检查 kd-cli 的版本更新，并提示用户
 * @returns {Promise<void>} 
 */
async function checkUpdate() {
    const notifier = updateNotifier({
        pkg: pkg,
        updateCheckInterval: 1000 * 60 * 60 * 24 // 1天
    })

    if (notifier.update) {
        // 显示手动更新命令的提示
        notifier.notify({
            defer: false, 
            isGlobal: true 
        })

        // 进行交互式自动更新
        await promptAutoUpdate(notifier.update.latest)
    }
}

/**
 * 提示用户是否进行自动更新
 */
async function promptAutoUpdate(latestVersion) {
    const response = await safePrompts({
        type: 'confirm',
        name: 'shouldUpdate',
        message: `是否要现在自动更新 ${pkg.name} 到最新版本 ${latestVersion}?`,
        initial: false
    })

    if (response.shouldUpdate) {
        // 调用自动更新函数
        await autoUpdate(pkg.name, latestVersion)
    } else {
        console.log(chalk.dim(`\n如需手动更新，请运行: npm install -g ${pkg.name}`))
    }
}

module.exports = checkUpdate