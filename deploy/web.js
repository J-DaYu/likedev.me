const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const WEB_PATH = './web/source';
const WEB_GIT_URL = 'https://github.com/J-DaYu/likedev.me-web.git';

module.exports = function () {
  // 检查 web 目录
  if (!fs.existsSync(WEB_PATH)) {
    shelljs.exec(`git clone ${WEB_GIT_URL} ${WEB_PATH}`)
  } else {
    console.log(`更新 ${WEB_PATH} 代码...`);
    shelljs.exec(`cd ${WEB_PATH} && git pull`);
  }

  shelljs.cd(WEB_PATH);
  shelljs.exec('sudo su');
  shelljs.exec('npm i');
  shelljs.exec('npm run build');

  return 'web 更新成功!';
}
