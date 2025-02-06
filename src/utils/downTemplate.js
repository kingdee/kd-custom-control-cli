const download = require('download-git-repo')
const ora = require('ora')
const { error, success } = require('./log.js')

const spiner = ora('模版下载中')

/**
 * 下载模板
 * @param {*} url git下载地址
 * @param {*} templateName 模版名称
 * @param {*} controlName 控件名称
 * @returns
 */
module.exports = (url, controlName, templateName) => {
  spiner.start()
  return new Promise((resolve, reject) => {
    download(url, controlName, { clone: true }, (err) => {
      if (err) {
        spiner.fail()
        console.log(err)
        error(`${templateName}模板下载失败,git地址 ${url}`)
        reject(err)
      } else {
        spiner.stop()
        success('下载模板完毕')
        resolve()
      }
    })
  })
}
