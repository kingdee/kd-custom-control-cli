// kwc/index.js
const fs = require('fs')
const path = require('path')

const exportsObj = {}
const files = fs.readdirSync(__dirname)

for (const file of files) {
  if (file === 'index.js' || !file.endsWith('.js')) continue
  const name = path.basename(file, '.js')
  exportsObj[name] = require(`./${file}`)
}

module.exports = exportsObj