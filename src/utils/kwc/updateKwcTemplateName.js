const updateKwcNameSpace = require('./updateKwcNameSpace')
const updateXmlNameTag = require('./updateXmlNameTag')
const replaceFilesContent = require('../replaceFilesContent')
// 'src/index.js',
// 'src/devIndex.js',
// 'server/config.js' 这三个文件中的controlName 替换成用户输入的那个值;
// // 如果是KWC则更新命名空间
// updateKwcNameSpace(controlName, initialName)
// // 更新xml文件中的name标签
// updateXmlNameTag(config)

async function updateKwcTemplateName ({ newName, initialName, filePath = 'src/index.js-meta.kwc' }) {
  const fileListMap = [
    'src/index.js',
    'src/devIndex.js',
    'server/config.js',
    'build/webpack.prod.js'
  ]
  await replaceFilesContent(
    fileListMap,
    newName,
    new RegExp(`${initialName}`, 'g')
  )
  updateKwcNameSpace(newName, initialName)
  const xmlFilePath = `src/${newName}.js-meta.kwc`
  updateXmlNameTag(newName, xmlFilePath)
}

module.exports = updateKwcTemplateName
