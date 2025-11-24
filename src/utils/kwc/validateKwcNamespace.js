function validateKwcNamespace (name) {
  const reserved = new Set(['html', 'svg'])

  if (typeof name !== 'string') {
    return { valid: false, error: '开发框架为KWC,方案id必须是字符串' }
  }
  // 长度限制：少于40个字符
  if (name.length > 40) {
    return { valid: false, error: '开发框架为KWC,方案id长度不能超过40个字符' }
  }
  // 必须以字母开头
  if (!/^[a-z]/.test(name)) {
    return { valid: false, error: '开发框架为KWC,方案id必须以小写字母开头' }
  }
  // 只能包含小写字母和数字
  if (!/^[a-z][a-z0-9]*$/.test(name)) {
    return { valid: false, error: '开发框架为KWC,方案id只能包含小写字母和数字' }
  }
  // 保留字禁止
  if (reserved.has(name)) {
    return { valid: false, error: `开发框架为KWC,方案id '${name}' 是保留字，不能使用` }
  }
  return { valid: true }
}

module.exports = validateKwcNamespace
