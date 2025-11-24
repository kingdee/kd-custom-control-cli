const fs = require('fs')
const path = require('path')
const os = require('os')
const { safePrompts } = require('../prompts')
const { decrypt } = require('../crypto')
const { OPEN_API } = require('../../constants/index')

/**
 * 读取或创建 ~/.kd-custom-control-cli/config.json 并获取对应 client 信息。
 * @param {string} backendUrl 后端地址
 * @param {object} dataCenter 包含 accountId 属性
 * @returns {Promise<{ client_id: string, client_secret: string, username: string }>}
 */
async function getClientConfig (backendUrl, dataCenter) {
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
  let entry = openApiConfig[key]
  // 如果已有配置，直接返回
  if (entry?.client_id && entry?.client_secret && entry?.username) {
    return {
      client_id: entry.client_id,
      client_secret: decrypt(entry.client_secret),
      username: entry.username
    }
  }

  // 引导用户输入
  const res = await safePrompts([
    {
      type: 'text',
      name: 'client_id',
      message: '*请输入OpenAPI第三方应用client_id',
      validate: v => !!v || 'OpenAPI第三方应用client_id不能为空'
    },
    {
      type: 'text',
      name: 'client_secret',
      message: '*请输入OpenAPI第三方应用client_secret',
      validate: v => !!v || 'OpenAPI第三方应用client_secret不能为空'
    },
    {
      type: 'text',
      name: 'username',
      message: '*请输入OpenAPI第三方应用username',
      validate: v => !!v || 'OpenAPI第三方应用username不能为空'
    }
  ])
  entry = {
    client_id: res.client_id,
    client_secret: res.client_secret,
    username: res.username,
    isNew: true
  }
  return entry
}

module.exports = getClientConfig