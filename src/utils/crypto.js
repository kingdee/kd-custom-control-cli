const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const os = require('os')

const KEY_FILE = path.join(os.homedir(), '.kd-custom-control-cli', 'secret.key')
const ALGORITHM = 'aes-256-cbc'

/**
 * 获取加密密钥，如果不存在则自动生成并保存
 */
function getKey () {
  if (!fs.existsSync(KEY_FILE)) {
    const dir = path.dirname(KEY_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const key = crypto.randomBytes(32) // 256 bit
    fs.writeFileSync(KEY_FILE, key.toString('hex'), 'utf-8')
    return key
  }
  return Buffer.from(fs.readFileSync(KEY_FILE, 'utf-8'), 'hex')
}

/**
 * 加密文本
 * @param {string} text - 明文
 * @returns {string} - base64编码的密文（包含 iv）
 */
function encrypt (text) {
  const key = getKey()
  const iv = crypto.randomBytes(16) // 128 bit
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return iv.toString('base64') + ':' + encrypted
}

/**
 * 解密文本
 * @param {string} data - base64编码的密文（iv:密文）
 * @returns {string} - 明文
 */
function decrypt (data) {
  if (!data) return ''
  const key = getKey()
  const [ivStr, encrypted] = data.split(':')
  const iv = Buffer.from(ivStr, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = { encrypt, decrypt }
