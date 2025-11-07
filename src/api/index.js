const crypto = require('crypto')
async function getAllDataCenters (url) {
  if (!url) return []
  const res = []
  try {
    url = url.trim().replace(/\/+$/, '')
    const resp = await fetch(`${url}/auth/getAllDatacenters.do`)
    if (resp?.status === 200) {
      const data = await resp.json()
      if (Array.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          if (d.accountId) {
            res.push({
              ...d,
              title: d.accountName,
              value: d.accountId
            })
          } else {
            console.warn(`⚠  数据中心返回异常，请检查url: ${url} 是否正确`)
          }
        }
      } else {
        console.warn(`⚠  数据中心列表为空，请检查url: ${url} 是否正确`)
      }
    } else {
      console.warn(`⚠  请求失败，请检查url: ${url} 是否正确`, resp)
    }
  } catch (e) {
    console.warn(`⚠  请求失败，请检查url: ${url} 是否正确`, e)
  }
  return res
}

async function getAccessToken (url, params) {
  if (!url) return {}
  let res = {}
  try {
    // 构造请求体
    const body = {
      client_id: params.client_id,
      client_secret: params.client_secret,
      username: params.username,
      accountId: params.accountId,
      language: 'zh_CN',
      nonce: crypto.randomBytes(8).toString('hex'),
      timestamp: `${Date.now()}`
    }
    url = url.trim().replace(/\/+$/, '')
    const resp = await fetch(`${url}/kapi/oauth2/getToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (resp?.status === 200) {
      const respData = await resp.json()
      if (respData?.status) {
        res = respData?.data || {}
      } else {
        console.warn('⚠  获取access_token失败，请检查url、client_id、client_secret、username是否正确', respData?.message)
      }
    } else {
      console.warn(`⚠  获取access_token失败，请检查url、client_id、client_secret、username是否正确, response status: ${resp?.status}`)
    }
  } catch (e) {
    console.warn('⚠  获取access_token失败，请检查url、client_id、client_secret、username是否正确', e?.message)
  }
  return res
}

module.exports = { getAllDataCenters, getAccessToken }
