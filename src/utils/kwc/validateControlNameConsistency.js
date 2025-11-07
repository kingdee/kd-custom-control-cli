// kwc/validateControlNameConsistency.js
const fs = require('fs')
const path = require('path')

function validateControlNameConsistency (xmlFilePath) {
  const cwd = process.cwd()

  const metaXmlPath = path.join(cwd, xmlFilePath)
  const indexJsPath = path.join(cwd, 'src/index.js')

  if (!fs.existsSync(metaXmlPath) || !fs.existsSync(indexJsPath)) {
    return {
      status: false,
      message: `❌ 未找到 ${xmlFilePath} 或 src/index.js 文件，请检查项目结构`
    }
  }

  // 获取 meta.xml 中的 <name>
  const xmlContent = fs.readFileSync(metaXmlPath, 'utf8')
  const xmlNameMatch = xmlContent.match(/<name>(.*?)<\/name>/)
  const xmlName = xmlNameMatch ? xmlNameMatch[1].trim() : null

  if (!xmlName) {
    return {
      status: false,
      message: `❌ 未在 ${xmlFilePath} 中找到 <name> 标签内容，请检查${xmlFilePath}文件`
    }
  }

  // 从 import 路径提取 namespace（取 / 前面的内容）
  const jsContent = fs.readFileSync(indexJsPath, 'utf8')
  const importMatch = jsContent.match(/import\(['"]([\w-]+)\/[\w-/]+['"]\)/)
  const importNs = importMatch ? importMatch[1].split('/')[0] : null

  // 3️⃣ 从 createElement 提取 namespace（取第一个 - 前的内容）
  const elementMatch = jsContent.match(/createElement\(['"]([\w-]+)-[\w-]+['"]/)
  const elementNs = elementMatch ? elementMatch[1].split('-')[0] : null

  const registerEleMatch = jsContent.match(/KDApi\.register\s*\(\s*['"`]([^'"`]+)['"`]/)
  const registerNs = registerEleMatch ? registerEleMatch[1] : null

  if (!importNs || !elementNs || !registerNs) {
    return {
      status: false,
      message: '⚠ 在src/index.js内未找到注册的方案id，请检查src/index.js文件'
    }
  }

  // 4️⃣ 校验一致性
  if (xmlName !== importNs || xmlName !== elementNs || xmlName !== registerNs) {
    return {
      status: false,
      message: `❌ 部署失败：${xmlFilePath}文件中声明的方案id(${xmlName})与src/index.js中注册的方案id不一致，请修改后重新部署。`
    }
  }
  return {
    status: true,
    data: {
      controlName: xmlName
    }
  }
}

module.exports = validateControlNameConsistency
