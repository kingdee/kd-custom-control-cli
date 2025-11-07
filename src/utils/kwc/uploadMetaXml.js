const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const axios = require('axios')

// 后端反馈有安全限制，可能会存在传输文件限制，所以需要支持文本上传
/**
 * 上传 meta.xml 文件
 * @param {string} backendUrl - 例如 http://localhost 或 https://example.com
 * @param {string} accessToken - 从 getToken() 获取的 access_token
 * @param {boolean} [forceSave=true] - 是否强制覆盖
 * @returns {Promise<void>}
 */
async function uploadMetaXml ({ backendUrl, accessToken, forceSave = false, xmlFilePath }) {
  const cwd = process.cwd()
  const filePath = path.join(cwd, xmlFilePath)

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ 未找到文件: ${filePath}`)
  }

  // 去掉 backendUrl 尾部的 /
  const baseUrl = backendUrl.trim().replace(/\/+$/, '')
  const url = `${baseUrl}/kapi/v2/mdl/updateKwc`

  // ============ 第一阶段：文本方式上传 ============
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8')

    const res = await axios.post(
      url,
      {
        content: xmlContent, // ✅ 将 XML 文件内容作为纯文本传输
        filename: path.basename(filePath), // 文件名
        forceSave: String(forceSave)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: accessToken
        }
      }
    )

    if (res.status === 200) {
      return res
    }
  } catch (err) {
    console.warn(`⚠ 文本上传方式失败，准备使用文件上传。错误原因: ${err.message}`)
  }

  // ============ 第二阶段：FormData 文件流上传 ============
  try {
    // 构造 FormData
    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath), {
      filename: path.basename(filePath)
    })
    formData.append('forceSave', String(forceSave))

    const res = await axios.post(url, formData, {
      headers: {
        access_token: accessToken, // ✅ 后端要求的 header
        ...formData.getHeaders() // ✅ 自动补上 multipart 边界
      }
    })
    return res
  } catch (err) {
    // console.warn(`⚠  文件上传方式失败，错误原因: ${err.message}`)
    return err
  }
}

module.exports = uploadMetaXml
