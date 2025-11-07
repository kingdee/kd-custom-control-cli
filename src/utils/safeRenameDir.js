const fs = require('fs')
const path = require('path')

/**
 * 安全重命名文件夹：复制 -> 删除（规避 EPERM）
 */
function safeRenameDir (oldDir, newDir) {
  if (!fs.existsSync(oldDir)) {
    throw new Error(`源目录不存在: ${oldDir}`)
  }

  // 如果目标目录已存在，先删掉
  if (fs.existsSync(newDir)) {
    fs.rmSync(newDir, { recursive: true, force: true })
  }

  // 递归复制目录
  function copyRecursive (src, dest) {
    const stat = fs.statSync(src)

    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true })
      for (const file of fs.readdirSync(src)) {
        copyRecursive(path.join(src, file), path.join(dest, file))
      }
    } else {
      fs.copyFileSync(src, dest)
    }
  }

  //   console.log(`📁 正在复制目录: ${oldDir} → ${newDir}`)
  copyRecursive(oldDir, newDir)

  //   console.log(`🗑 正在删除旧目录: ${oldDir}`)
  fs.rmSync(oldDir, { recursive: true, force: true })

  //   console.log(`✅ 目录重命名完成: ${newDir}`)
}

module.exports = safeRenameDir
