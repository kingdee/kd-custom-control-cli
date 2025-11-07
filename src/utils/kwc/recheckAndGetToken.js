const fs = require('fs')
const path = require('path')
const os = require('os')
const { safePrompts } = require('../prompts')
const { encrypt } = require('../crypto')
const { getAccessToken } = require('../../api')
const { OPEN_API } = require('../../constants/index')

async function recheckAndGetToken (backendUrl, dataCenter, clientConfig) {
  if (!backendUrl || !dataCenter?.accountId) {
    return
  }

  // 去掉 backendUrl 尾部的 /
  const normalizedUrl = backendUrl.trim().replace(/\/+$/, '')

  const key = `${normalizedUrl}_${dataCenter.accountId}`
  //   let entry = config[key]

  // 引导用户输入
  const res = await safePrompts([
    {
      type: 'text',
      name: 'client_id',
      message: '请检查client_id',
      validate: v => !!v || 'client_id不能为空',
      initial: clientConfig.client_id
    },
    {
      type: 'text',
      name: 'client_secret',
      message: '请检查client_secret',
      validate: v => !!v || 'client_secret不能为空',
      initial: clientConfig.client_secret
    },
    {
      type: 'text',
      name: 'username',
      message: '请检查username',
      validate: v => !!v || 'username不能为空',
      initial: clientConfig.username
    }
  ])
  const entry = {
    client_id: res.client_id,
    client_secret: res.client_secret,
    username: res.username
  }
  // - 调用openApi获取access_token
  const getAccessTokenParams = {
    accountId: dataCenter.accountId,
    ...entry
  }
  const tokenData = await getAccessToken(backendUrl, getAccessTokenParams) || {}
  const token = tokenData.access_token || ''
  if (!token) return
  // - 保存到本地
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
  // 保存配置
  entry.client_secret = encrypt(entry.client_secret)
  openApiConfig[key] = entry
  config[OPEN_API] = openApiConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  // 返回token
  return token
}

module.exports = recheckAndGetToken
