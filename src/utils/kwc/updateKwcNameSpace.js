const safeRenameDir = require('../safeRenameDir')
const fs = require('fs')
const path = require('path')

function exists (p) {
  try { return fs.existsSync(p) } catch (e) { return false }
}

function readFileSafe (p) {
  try { return fs.readFileSync(p, 'utf8') } catch (e) { return null }
}

function writeFileSafe (p, content) {
  fs.writeFileSync(p, content, 'utf8')
}

function _updateKwcNameSpace (filePath, nameSpace, initialName) {
  const original = readFileSafe(filePath)
  if (original === null) {
    console.warn(`File not found: ${filePath} — skipping.`)
    return
  }

  let updated = original

  // 全局替换 x/ -> nameSpace/
  // updated = updated.replace(/x\//g, `${nameSpace}/`)
  updated = updated.replace(new RegExp(`${initialName}/`, 'g'), `${nameSpace}/`)

  // 全局替换 x- -> nameSpace-
  // updated = updated.replace(/x-/g, `${nameSpace}-`)
  updated = updated.replace(new RegExp(`${initialName}-`, 'g'), `${nameSpace}-`)
  if (updated !== original) {
    writeFileSafe(filePath, updated)
  }
}

function updateKwcNameSpace (nameSpace, initialName = 'x') {
  const cwd = process.cwd()
  const projectRootCandidate = path.resolve(cwd, nameSpace)
  let projectRoot
  if (exists(projectRootCandidate)) {
    projectRoot = projectRootCandidate
  } else if (exists(path.join(cwd, 'src'))) {
    projectRoot = cwd
  } else {
    console.error(
      `Can't locate project root. Tried:\n - ${projectRootCandidate}\n - ${cwd}\n` +
      `Make sure you run this command from the correct directory or that "${nameSpace}" exists under current path.`
    )
    process.exit(1)
  }

  const srcDir = path.join(projectRoot, 'src')
  const buildDir = path.join(projectRoot, 'build')
  const modulesDir = path.join(srcDir, 'modules')
  const oldDir = path.join(modulesDir, initialName)
  const newDir = path.join(modulesDir, nameSpace)

  // 1) 重命名文件夹（如果存在）
  if (!exists(modulesDir)) {
    console.warn(`Warning: "${modulesDir}" not found. Skipping folder rename.`)
  } else if (!exists(oldDir)) {
    console.warn(`Warning: "${oldDir}" not found. Skipping folder rename.`)
  } else {
    if (exists(newDir)) {
      console.error(`Destination "${newDir}" already exists. Aborting folder rename to avoid overwrite.`)
      process.exit(1)
    }
    try {
      // fs.renameSync(oldDir, newDir)
      safeRenameDir(oldDir, newDir)
    } catch (err) {
      console.error('Failed to rename folder:', err.message)
      process.exit(1)
    }
  }

  // 重命名index.js-meta.kwc 文件

  const xmlOldPath = path.join(srcDir, initialName === 'x' ? 'index.js-meta.kwc' : `${initialName}.js-meta.kwc`)
  const xmlNewPath = path.join(srcDir, `${nameSpace}.js-meta.kwc`)
  if (fs.existsSync(xmlOldPath)) {
    // fs.renameSync(xmlOldPath, xmlNewPath)
    safeRenameDir(xmlOldPath, xmlNewPath)
  }

  // 2) 更新 src/index.js 和 src/devIndex.js 中的引用
  const indexArr = ['index.js', 'devIndex.js']
  const webpackArr = ['webpack.dev.js', 'webpack.prod.js']

  indexArr.forEach((fileName) => {
    const filePath = path.join(srcDir, fileName)
    _updateKwcNameSpace(filePath, nameSpace, initialName)
  })
  webpackArr.forEach((fileName) => {
    const filePath = path.join(buildDir, fileName)
    _updateKwcNameSpace(filePath, nameSpace, initialName)
  })
}

module.exports = updateKwcNameSpace
