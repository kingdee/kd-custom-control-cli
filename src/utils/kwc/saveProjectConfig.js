// 在项目根目录下创建.kd-custom-control-cli文件夹
// 在.kd-custom-control-cli文件夹下创建project.config.json文件
// 把kwcConfig写入.kd-custom-control-cli/project.config.json文件
// 把.kd-custom-control-cli/ 写入.gitignore文件

const fs = require("fs");
const path = require("path");

/**
 * 保存项目级配置
 * @param {Object} config - 用户配置对象
 */
function saveProjectConfig (namespace = '', config) {
  const cwd = process.cwd();
  const projectRoot = path.resolve(cwd, namespace);
  const cliDir = path.join(projectRoot, '.kd-custom-control-cli');
  const configPath = path.join(cliDir, 'project.config.json');
  const gitignorePath = path.join(projectRoot, '.gitignore');

  // 1. 创建 .kd-custom-control-cli 目录（若不存在）
  if (!fs.existsSync(cliDir)) {
    fs.mkdirSync(cliDir, { recursive: true });
  }

  // 2. 写入配置文件
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ 写入 project.config.json 失败:', err);
    return;
  }

  // 3. 确保 .gitignore 文件存在并包含 .kd-custom-control-cli/
  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  if (!gitignoreContent.includes('.kd-custom-control-cli/')) {
    gitignoreContent = gitignoreContent.trimEnd() + '\n.kd-custom-control-cli/\n';
    fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  } else {
    // console.log('ℹ️ .gitignore 已包含 .kd-custom-control-cli/');
  }
}

module.exports = saveProjectConfig;
