const prompts = require('prompts')
const path = require('path')
const fs = require('fs')
const exit = require('./exit.js')
const { success } = require('./log.js')
const downTemplate = require('./downTemplate.js')
const templatesJson = require('../config/template.json')
const updateTemplate = require('./updateTemplate.js')

const successLog = (name, isJq) => {
  success(`自定义控件 ${name} 创建成功${isJq ? '' : '，执行下面命令启动项目'}`)
  if (!isJq) {
    success(`cd ${name}`)
    success(`npm install`)
    success(`npm start`)
  }
}

const TemplateMap = {
  React: 'React',
  Vue2: 'Vue2',
  Vue3: 'Vue3',
  jQuery: 'jQuery',
}

const choices = Object.keys(TemplateMap).map((key) => ({
  title: key,
  value: TemplateMap[key],
}))

const promptsOptions = [
  {
    type: 'select', //单选
    name: 'gender',
    message: '选择您需要的开发框架',
    choices: choices,
  },
]

const choseUIFn = (uiName) => {
  return {
    type: 'toggle',
    name: 'value',
    message: `是否需要安装${uiName}？`,
    initial: true,
    active: '是',
    inactive: '否',
  }
}

const installTemplate = async (templateUrl, controlName, templateName) => {
  try {
    await downTemplate(templateUrl, controlName, templateName)
    await updateTemplate(controlName, templateName)
    successLog(controlName, templateName === TemplateMap.jQuery)
  } catch (error) {
    exit(error.message)
  }
}

module.exports = async (name) => {
  const cwd = process.cwd()
  const targetPath = path.resolve(cwd, name || '.') //生成模版目录
  if (fs.existsSync(targetPath)) {
    exit('当前路径下已存在该自定义控件')
  }

  let hasUI = true
  const res = await prompts(promptsOptions)
  const templateName = res.gender
  if (templateName === TemplateMap.React) {
    const hasKUI = await prompts(choseUIFn('KDesign'))
    hasUI = hasKUI.value
  } else if (templateName.substring(0, 3) === 'Vue') {
    const hasElementUI = await prompts(choseUIFn('element-ui'))
    hasUI = hasElementUI.value
  }

  const templateKey = `${templateName}${hasUI ? '' : '-noUI'}`

  const templateUrl = templatesJson[templateKey]

  await installTemplate(templateUrl, name, templateName)
}
