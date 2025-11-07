const fs = require('fs')
const path = require('path')
const os = require('os')

/**
 * 查看配置：
 * - 全局配置：~/.kd-custom-control-cli/config.json
 * - 本地配置：.kd-custom-control-cli/project.config.json
 */
async function showConfig (options = {}) {
  const { local = false } = options

  if (local) {
    // 本地配置路径
    const localConfigPath = path.join(process.cwd(), '.kd-custom-control-cli', 'project.config.json')

    if (!fs.existsSync(localConfigPath)) {
      console.log('⚠ 本地项目配置不存在')
      return
    }

    try {
      const content = fs.readFileSync(localConfigPath, 'utf-8')
      const json = JSON.parse(content)

      console.log('📄 本地项目配置 (.kd-custom-control-cli/project.config.json):')
      console.log(JSON.stringify(json, null, 2))
    } catch (err) {
      console.error('❌ 无法读取本地项目配置:', err.message)
    }

    return
  }

  // ======= 全局配置 =======
  const home = os.homedir()
  const globalConfigPath = path.join(home, '.kd-custom-control-cli', 'config.json')

  if (!fs.existsSync(globalConfigPath)) {
    console.log('⚠ 脚手架全局配置不存在：~/.kd-custom-control-cli/config.json')
    return
  }

  try {
    const content = fs.readFileSync(globalConfigPath, 'utf-8')
    const json = JSON.parse(content)

    console.log('📄 脚手架全局配置 (~/.kd-custom-control-cli/config.json):')
    console.log(JSON.stringify(json, null, 2))
  } catch (err) {
    console.error('❌ 无法读取脚手架全局配置:', err.message)
  }
}

module.exports = showConfig
