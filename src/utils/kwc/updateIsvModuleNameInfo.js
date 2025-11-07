const { safePrompts } = require('../prompts')
const getMetaXmlFieldsValue = require('./getMetaXmlFieldsValue')
const updateMetaXml = require('./updateMetaXml')
const updateServerConfig = require('./updateServerConfig')
/**
 * @param {Object} xmlFilePath - xml 文件路径
 * 先从xml获取方案id、开发商标识和领域标识，如果没有引导用户输入
 * 根据用户输入的信息更新xml和server/config.js
 */
async function updateIsvModuleNameInfo (xmlFilePath) {
  const xmlFields = ['masterLabel', 'isv', 'moduleid']
  const metaXmlFieldValue = getMetaXmlFieldsValue(xmlFilePath, xmlFields) || {}
  let { masterLabel: solutionName, moduleid: moduleId, isv: isvId } = metaXmlFieldValue
  if (solutionName && moduleId && isvId) return // 不是第一次deploy，已输入过
  const promptsArr = []
  if (!solutionName) {
    promptsArr.push({
      type: 'text',
      name: 'solutionName',
      message: '请输入方案名称(*)',
      validate: v => !!v || '方案名称不能为空'
    })
  }
  if (!moduleId) {
    promptsArr.push({
      type: 'text',
      name: 'moduleId',
      message: '请输入领域标识',
      validate: v => !!v || '领域标识不能为空'
    })
  }
  if (!isvId) {
    promptsArr.push({
      type: 'text',
      name: 'isvId',
      message: '请输入开发商标识',
      validate: v => !!v || '开发商标识不能为空'
    })
  }
  // --- 基础信息 ---
  const basicInfo = await safePrompts(promptsArr) || {}
  solutionName = basicInfo.solutionName || solutionName
  moduleId = basicInfo.moduleId || moduleId
  isvId = basicInfo.isvId || isvId
  // 更新xml
  const updateMetaXmlConfig = {
    masterLabel: solutionName,
    moduleid: moduleId,
    isv: isvId
  }
  updateMetaXml(xmlFilePath, updateMetaXmlConfig)
  // 更新server/config.js
  const updateServerConfigData = {
    isvId,
    moduleId
  }
  const serverConfigFilePath = 'server/config.js'
  updateServerConfig(serverConfigFilePath, updateServerConfigData)
}

module.exports = updateIsvModuleNameInfo