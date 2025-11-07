const fs = require('fs')
const path = require('path')

const replacements = {
  masterLabel: '${SOLUTION_NAME}',
  isv: '${ISV_ID}',
  moduleid: '${MODULE_ID}',
  name: '${CONTROL_NAME}'
}

/**
 * @param {Object} config - 用户配置对象
 * fields ['masterLabel', 'isv', 'moduleid'] ${SOLUTION_NAME} ${ISV_ID} ${MODULE_ID}
 * @returns {object} {}
 */
function getMetaXmlFieldsValue (xmlFilePath, fields) {
  const cwd = process.cwd()
  const metaXmlPath = path.join(cwd, xmlFilePath)
  if (!fields) return {}
  fields = Array.isArray(fields) ? fields : [fields]
  const res = {}

  if (!fs.existsSync(metaXmlPath)) {
    return res
  }

  const xmlContent = fs.readFileSync(metaXmlPath, 'utf8')

  const getMatchValue = (tag) => {
    const regex = new RegExp(`<${tag}>\\s*(.*?)\\s*<\\/${tag}>`)
    const match = xmlContent.match(regex)
    return match && match[1]
  }

  fields.forEach(element => {
    let fieldValue = getMatchValue(element) || ''
    if (fieldValue && fieldValue === replacements[element]) {
      fieldValue = ''
    }
    res[element] = fieldValue
  })

  return res
}

module.exports = getMetaXmlFieldsValue
