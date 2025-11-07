const prompts = require('prompts')

function safePrompts (questions) {
  return prompts(questions, {
    onCancel: () => {
      console.log('\n❌ 操作已取消，脚手架终止。')
      process.exit(0)
    }
  })
}

module.exports = {
  safePrompts
}