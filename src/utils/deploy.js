const {
  validateControlNameConsistency,
  getProjectConfig,
  getClientConfig,
  uploadMetaXml,
  recheckAndGetToken,
  updateKwcTemplateName,
  getMetaKwcFile,
  updateIsvModuleNameInfo
} = require('./kwc')
const path = require('path')
const fs = require('fs')
const ora = require('ora')
const { getAccessToken } = require('../api')
const runBuild = require('./runBuild')
const { safePrompts } = require('./prompts')
const spiner = ora('元数据文件上传中')
const reUploadSpiner = ora('元数据文件重新上传中')
const { error, success, warn } = require('./log.js')
async function deploy (options) {
  const { force = false } = options || {}
  // 参数检查
  //  - 方案id的检测： xml中的方案id与src/index.js 中import 导入的和createElement 中的是否一致 ， 如果不一致引用用户进行修改
  //  - xml 文件中是否有输入方案名称、领域标识、开发商标识 （领域标识、开发商标识是否有格式要求要产品再次确认）- 哪个参数没有值就引导用户输入，eg： 请输入领域标识.
  //  - 读取.kd-custom-control-cli/project.config.json 内容，获取后台环境url、数据中心，两个仓库（这个是提交仓库命令行的时候再进行校验），并进行格式校验，如果没值或不符合规格，引导用户输入/修改， eg：请输入/修改后台环境url
  // const xmlFilePath = 'src/index.js-meta.xml'
  const xmlFilePath = getMetaKwcFile()
  if (!xmlFilePath) {
    warn('⚠  非kwc框架暂不支持部署')
    return
  }
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    warn('⚠  当前目录未检测到 package.json，无法执行构建部署。')
    return
  }
  const isConsistency = validateControlNameConsistency(xmlFilePath) || {}
  if (!isConsistency?.status) {
    error(isConsistency.message)
    return
  }
  const controlName = isConsistency?.data?.controlName

  const { solutionName } = await updateIsvModuleNameInfo(xmlFilePath) || {}

  // 先从本地项目config获取后台地址和数据中心，如果没值或格式不对，引导用户输入/修改， eg：请输入/修改后台环境url

  const { backendUrl, dataCenter } = await getProjectConfig()

  // openApi登录授权
  // - 读取~/.kd-custom-control-cli/config.json 内容，获取backendUrl_dataCenter.accountId 的client_id、client_secret、
  // username信息，如果没有，引导用户输入并保存到~/.kd-custom-control-cli/config.json
  const clientConfig = await getClientConfig(backendUrl, dataCenter)
  if (!clientConfig) return

  // - 调用openApi获取access_token
  const getAccessTokenParams = {
    client_id: clientConfig.client_id,
    client_secret: clientConfig.client_secret,
    username: clientConfig.username,
    accountId: dataCenter.accountId
  }
  const tokenData = await getAccessToken(backendUrl, getAccessTokenParams) || {}
  let token = tokenData.access_token || ''
  if (!token) {
    token = await recheckAndGetToken(backendUrl, dataCenter, clientConfig)
    if (!token) {
      error('重输入的client_id、client_secret、username有误无法成功获取token，部署失败')
      return
    }
  }
  // 执行npm run build
  await runBuild()
  // 根据环境参数调用api 上传xml
  // 如果是重复，命令行让用户输入要替换的方案id，然后更新模板，重新上传？?
  spiner.start()
  const uploadRes = await uploadMetaXml({ backendUrl, accessToken: token, forceSave: force, xmlFilePath })
  if (uploadRes?.status === 200) {
    const uploadResData = uploadRes?.data || {}
    if (uploadResData?.status) {
      spiner.stop()
      const successLog = `
 xml元数据成功上传苍穹环境。
 KWC自定义控件默认配置说明如下：
   1. 控件方案ID默认为${controlName}，默认命名规则【项目名称】
   2. 控件名称默认为${solutionName}, 默认命名规则【方案名称】
   3. 控件标识默认为${controlName}ap，默认命名规则【项目名称+ap】
`
      success(successLog)
      return
    }
    if (uploadResData?.errorCode === '1001') {
      spiner.stop()
      // 组件已存在
      warn(`${uploadResData?.message}`)
      // 命令行让用户输入要替换的方案id，然后更新模板，重新上传？?
      const getNamePrompt = {
        type: 'text',
        name: 'name',
        message: `${controlName}已被占用,请输入新的方案id`,
        validate: v => {
          return (v && v !== controlName) || '替换的方案id不能为空且与当前方案id不能相同'
        }
      }
      const nameRes = await safePrompts(getNamePrompt)
      // 更新完模板需要重新run build 再上传
      await updateKwcTemplateName({ initialName: controlName, newName: nameRes?.name, filePath: xmlFilePath })
      await runBuild()
      const newXmlFilePath = `src/${nameRes?.name}.js-meta.kwc`
      reUploadSpiner.start()
      const reUploadRes = await uploadMetaXml({ backendUrl, accessToken: token, forceSave: force, xmlFilePath: newXmlFilePath })
      if (reUploadRes?.status === 200 && reUploadRes?.data?.status) {
        reUploadSpiner.stop()
        const successLog = `
 xml元数据成功上传苍穹环境。
 KWC自定义控件默认配置说明如下：
   1. 控件方案ID默认为${nameRes?.name}，默认命名规则【项目名称】
   2. 控件名称默认为${solutionName}, 默认命名规则【方案名称】
   3. 控件标识默认为${nameRes?.name}ap，默认命名规则【项目名称+ap】
        `
        success(successLog)
      } else {
        reUploadSpiner.stop()
        error(`元数据文件重新上传失败： ${reUploadRes?.data?.message || reUploadRes?.message}`)
      }
    } else {
      spiner.stop()
      error(`元数据文件上传失败： ${uploadResData?.message}`)
    }
  } else {
    spiner.stop()
    error(`元数据文件上传失败： ${uploadRes?.message}`)
  }
}
module.exports = deploy