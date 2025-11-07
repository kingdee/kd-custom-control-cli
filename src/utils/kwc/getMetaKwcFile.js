const fs = require('fs')
const path = require('path')
/**
 * 查找 src 目录下以 .js-meta.kwc 结尾的文件（不递归）
 * 输出相对路径，如 src/index.js-meta.kwc
 */
function getMetaKwcFile (dir = 'src') {
  const cwd = process.cwd()
  const srcDir = path.join(cwd, dir)

  if (!fs.existsSync(srcDir)) {
    return ''
  }

  const files = fs.readdirSync(srcDir, { withFileTypes: true })
  const result = files
    .filter(f => f.isFile() && f.name.endsWith('.js-meta.kwc'))
    .map(f => path.join(dir, f.name).replace(/\\/g, '/')) // 保持统一的路径格式

  if (result.length === 0) {
    return ''
  } else {
    return result[0]
  }
}

module.exports = getMetaKwcFile
