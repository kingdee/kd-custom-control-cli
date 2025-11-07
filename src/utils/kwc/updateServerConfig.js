const fs = require('fs')
const path = require('path')

/**
 * 更新server.config.js
 * @param {string} configPath - 例如 'server/config.js'
 * @param {Object} updates - { tagName: newValue }
 */
function updateServerConfig (configPath, updates = {}) {
  const cwd = process.cwd()
  const filePath = path.join(cwd, configPath)

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ 文件不存在: ${filePath}`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  // 匹配 module.exports = { ... }
  const exportsRegex = /module\.exports\s*=\s*\{([\s\S]*?)\}\s*;?\s*$/m
  const match = content.match(exportsRegex)

  if (!match) {
    throw new Error(`未找到 module.exports 对象: ${filePath}`)
  }

  const objText = match[1] // 不含外层大括号
  const lines = objText.split(/\r?\n/)

  // 去掉对象体首尾多余空行（非常重要）
  while (lines.length && lines[0].trim() === '') lines.shift()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()

  const formatValue = (v) => {
    if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    return String(v)
  }

  const replaced = new Set()

  // ✅ 替换已有字段
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const [key, newValue] of Object.entries(updates)) {
      const keyRegex = new RegExp(
        `^(\\s*)${key}\\s*:\\s*([^\\/\\n]*?)(\\s*)(\\/\\/.*)?$`
      )

      const m = line.match(keyRegex)
      if (!m) continue

      const indent = m[1] || ''
      const trailingSpaces = m[3] || ''
      const comment = m[4] || ''
      const hasComma = /,\s*$/.test(m[2] || '')

      lines[i] = `${indent}${key}: ${formatValue(newValue)}${hasComma ? ',' : ''}${trailingSpaces}${comment}`
      replaced.add(key)

      break
    }
  }

  // ✅ 如果字段不存在，追加（在对象体末尾，且不增加空行）
  const toAdd = Object.keys(updates).filter((k) => !replaced.has(k))
  if (toAdd.length > 0) {
    let indent = '  '
    for (const l of lines) {
      const m = l.match(/^(\s*)\S/)
      if (m) {
        indent = m[1]
        break
      }
    }

    toAdd.forEach((key) => {
      lines.push(`${indent}${key}: ${formatValue(updates[key])},`)
    })
  }

  // ✅ 确保对象体结尾无多余空行
  while (lines.length && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }

  const newObj = lines.join('\n')

  const newContent = content.replace(
    exportsRegex,
    `module.exports = {\n${newObj}\n}`
  )

  fs.writeFileSync(filePath, newContent, 'utf-8')
}

module.exports = updateServerConfig
