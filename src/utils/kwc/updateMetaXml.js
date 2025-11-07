const fs = require('fs')
const path = require('path')

/**
 * 更新 XML 文件中的标签内容
 * @param {string} xmlFilePath - 例如 'src/index.js-meta.xml'
 * @param {Object} updateMap - { tagName: newValue }
 */
function updateMetaXml (xmlFilePath, updateMap = {}) {
  // const { controlName, solutionName, isvId, moduleId } = config
  const cwd = process.cwd()
  const metaPath = path.join(cwd, xmlFilePath)

  if (!fs.existsSync(metaPath)) {
    console.warn(`⚠ 文件不存在: ${metaPath}`)
    return
  }

  let content = fs.readFileSync(metaPath, 'utf8')

  Object.entries(updateMap).forEach(([tag, newValue]) => {
    // 支持 <tag>xxx</tag>
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)

    if (!regex.test(content)) {
      console.warn(`⚠ 未找到标签 <${tag}>，已跳过`)
      return
    }

    const replacement = `<${tag}>${newValue}</${tag}>`
    content = content.replace(regex, replacement)
  })

  fs.writeFileSync(metaPath, content, 'utf-8')
}

module.exports = updateMetaXml
