const { safePrompts } = require('../prompts')
const { getAccessToken } = require('../../api')

async function recheckAndGetToken (backendUrl, dataCenter, clientConfig) {
  if (!backendUrl || !dataCenter?.accountId) {
    return {}
  }
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
  return {
    tokenData,
    clientConfig: entry
  }
}

module.exports = recheckAndGetToken