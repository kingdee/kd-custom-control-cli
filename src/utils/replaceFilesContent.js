const fs = require('fs')
const path = require('path')
const replaceFileContent = (fileName, reg, replaceStr) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, "utf8", function (err, files) {
      var result = files.replace(reg, replaceStr)

      fs.writeFile(fileName, result, "utf8", function (err) {
        if (err) {
          console.log(err)
          return reject(err)
        }
        return resolve()
      })
    })
  })
}

const replaceFilesContent = async (fileList, controlName, reg) => {
  // 获取当前执行命令的路径
  const cwd = process.cwd()

  for (let i = 0; i < fileList.length; i++) {
    const filePath = path.resolve(cwd, `${fileList[i]}`)
    if (fs.existsSync(filePath)) {
      await replaceFileContent(filePath, reg, controlName)
    }
  }
}
module.exports = replaceFilesContent
