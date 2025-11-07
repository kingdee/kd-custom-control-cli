// resetConfig.js
const fs = require('fs')
const path = require('path')
const os = require('os')

async function resetConfig (options) {
  const { local = false } = options || {}

  if (local) {
    // ✅ 重置本地项目配置
    const projectConfigPath = path.join(
      process.cwd(),
      '.kd-custom-control-cli/project.config.json'
    )

    resetOne(projectConfigPath, {
      backendUrl: '',
      dataCenter: {
        accountId: ''
      }
    })

    console.log(`✅ 本地项目配置已重置: ${projectConfigPath}`)
  } else {
    // ✅ 重置全局 config
    const globalDir = path.join(os.homedir(), '.kd-custom-control-cli')
    const globalConfigPath = path.join(globalDir, 'config.json')

    resetOne(globalConfigPath, {
      // 默认留空，由用户重新 CLI 登录或输入
    })

    console.log(`✅ 脚手架全局配置已重置: ${globalConfigPath}`)
  }
}

/**
 * ✅ 重置指定配置文件
 * 如果目录不存在会自动创建
 */
function resetOne (filePath, defaultContent) {
  const dir = path.dirname(filePath)

  // 创建目录
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // 写入默认内容
  fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf-8')
}

module.exports = resetConfig
