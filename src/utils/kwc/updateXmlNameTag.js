const fs = require('fs')
const path = require('path')

/**
 * 替换 src/index.js-meta.xml 中的name标签的值
 */
function updateXmlNameTag (newName, filePath = 'src/index.js-meta.kwc') {
  const cwd = process.cwd()
  const xmlPath = path.join(cwd, filePath)
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`❌ XML 文件不存在: ${xmlPath}`)
  }

  const content = fs.readFileSync(xmlPath, 'utf-8')

  // 正则匹配 <name>xxx</name> 中的内容
  const regex = /<name>(.*?)<\/name>/

  if (!regex.test(content)) {
    throw new Error('⚠ 未找到 <name> 标签，请检查 XML 文件格式')
  }

  // 替换成新内容
  const newContent = content.replace(regex, `<name>${newName}</name>`)

  fs.writeFileSync(xmlPath, newContent, 'utf-8')
}

module.exports = updateXmlNameTag
