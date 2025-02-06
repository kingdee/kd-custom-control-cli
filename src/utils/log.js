const chalk = require('chalk')

const warn = (msg) => {
  console.log(chalk.yellow(msg))
}
const error = (msg) => {
  console.log(chalk.red(msg))
}

const success = (msg) => {
  console.log(chalk.green(msg))
}

const mark = (msg) => {
  console.log(chalk.magenta(msg))
}

module.exports = {
  warn,
  error,
  success,
  mark,
}
