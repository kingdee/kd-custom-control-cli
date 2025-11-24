const fs = require('fs')
const path = require('path')
const os = require('os')
const { OPEN_API } = require('../../constants/index')

/**
 * 保存client 信息到 ~/.kd-custom-control-cli/config.json
 * @param {string} backendUrl 后端地址
 * @param {object} dataCenter 包含 accountId 属性
 */
async function saveClientConfig (backendUrl, dataCenter, clientInfo) {
  if (!backendUrl || !dataCenter?.accountId) {
    return
  }

  // 去掉 backendUrl 尾部的 /
  const normalizedUrl = backendUrl.trim().replace(/\/+$/, '')

  // 文件路径
  const homeDir = os.homedir()
  const cliDir = path.join(homeDir, '.kd-custom-control-cli')
  const configPath = path.join(cliDir, 'config.json')

  // 确保目录存在
  if (!fs.existsSync(cliDir)) fs.mkdirSync(cliDir, { recursive: true })

  // 读取配置文件
  let config = {}
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8').replace(/^\uFEFF/, ''))
    } catch {
      config = {}
    }
  }

  if (!config[OPEN_API]) {
    config[OPEN_API] = {}
  }

  const openApiConfig = config[OPEN_API]

  const key = `${normalizedUrl}_${dataCenter.accountId}`
  // 保存配置
  openApiConfig[key] = clientInfo
  config[OPEN_API] = openApiConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

module.exports = saveClientConfig