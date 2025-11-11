const fs = require('fs')
const path = require('path')
const { safePrompts } = require('../prompts')
const { getAllDataCenters } = require('../../api')
const saveProjectConfig = require('./saveProjectConfig')

/**
 * 获取 .kd-custom-control-cli/project.config.json 的配置
 * - backendUrl 必须为合法 URL
 * - dataCenter 必须为对象且包含 accountId
 *
 * @returns {boolean} 验证是否通过
 */
async function getProjectConfig () {
  const cwd = process.cwd()
  const cliDir = path.join(cwd, '.kd-custom-control-cli')
  const configPath = path.join(cliDir, 'project.config.json')
  const gitignorePath = path.join(cwd, '.gitignore')

  // 如果此文件已存在能正常读取数据正常就先返回

  // 检查文件是否存在
  if (!fs.existsSync(configPath)) {
    try {
      // 如果检查文件不存在就创建一个文件
      if (!fs.existsSync(cliDir)) {
        fs.mkdirSync(cliDir, { recursive: true })
      }
      // 2. 写入配置文件
      fs.writeFileSync(configPath, JSON.stringify({}, null, 2), 'utf8')
      // 3. 确保 .gitignore 文件存在并包含 .kd-custom-control-cli/
      let gitignoreContent = ''
      if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
      }

      if (!gitignoreContent.includes('.kd-custom-control-cli/')) {
        gitignoreContent = gitignoreContent.trimEnd() + '\n.kd-custom-control-cli/\n'
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8')
      }
    } catch (err) {
      console.error('❌ 写入 project.config.json 或 .gitignore 失败:', err)
    }
  }

  // 读取文件内容
  let config = {}
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8')) || {}
  } catch (err) {
    console.log(err, '读取项目配置文件出错')
  }

  let { backendUrl, dataCenter } = config || {}

  // 校验 backendUrl
  const isValidUrl = (url) => {
    try {
      const u = new URL(url)
      return ['http:', 'https:'].includes(u.protocol)
    } catch {
      return false
    }
  }

  const isValidDataCenter = (dc) => {
    return typeof dc === 'object' && dc.accountId && typeof dc.accountId === 'string' && dc.accountId.trim()
  }

  if (backendUrl && isValidUrl(backendUrl) && dataCenter && isValidDataCenter(dataCenter)) {
    return { backendUrl, dataCenter }
  }

  let getBackendUrlPrompt

  if (!backendUrl) {
    getBackendUrlPrompt = {
      type: 'text',
      name: 'backendUrl',
      message: '*请输入苍穹环境地址(格式为：[http/https]://[ip地址/域名])',
      validate: (input) => isValidUrl(input) || '请输入合法的 http/https URL'
    }
  } else if (!isValidUrl(backendUrl)) {
    getBackendUrlPrompt = {
      type: 'text',
      name: 'backendUrl',
      message: '请修改苍穹环境地址(格式为：[http/https]://[ip地址/域名])',
      validate: (input) => isValidUrl(input) || '请输入合法的 http/https URL',
      initial: backendUrl
    }
  }

  if (getBackendUrlPrompt) {
    const dcRes = await safePrompts(getBackendUrlPrompt)
    backendUrl = dcRes.backendUrl
  }

  // 校验 dataCenter
  if (!dataCenter || !isValidDataCenter(dataCenter)) {
    const datacenterChoices = await getAllDataCenters(backendUrl) || []
    if (datacenterChoices.length > 0) {
      const datacenterPrompt = {
        type: 'select',
        name: 'datacenterId',
        message: '请选择数据中心',
        choices: [...datacenterChoices]
      }
      const dcRes = await safePrompts(datacenterPrompt)
      dataCenter = datacenterChoices.find(dc => dc.value === dcRes.datacenterId) || {}
    }
  }

  config.backendUrl = backendUrl
  config.dataCenter = dataCenter
  if (config.backendUrl && config.dataCenter?.accountId) {
    saveProjectConfig('', config)
  }

  return {
    backendUrl, dataCenter
  }
}

module.exports = getProjectConfig