const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const DOC_PATH = './web/docs';
const DOC_GIT_URL = 'https://github.com/J-DaYu/notes.git';
const HOOK_CONFIG = require('../hook.config');
/**
 * 同步递归读取文件
 * 代码来来自于: https://gist.github.com/kethinov/6658166
 * @param  {String} dir      文件目录
 * @param  {Array}  filelist 文件列表
 * @return {Array}           文件结果列表
 */
const walkSync = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file + '/', filelist);
    } else if(/\.md$/.test(file)) {
      filelist.push({
        tag: dir.replace(/(\.|web|docs|\/)/g, ''),
        path: path.join(dir, file),
        name: file
      });
    }
  });
  return filelist;
};
// 检查 docs 目录
if (!fs.existsSync(DOC_PATH)) {
  shelljs.exec(`git clone ${DOC_GIT_URL} ${DOC_PATH}`)
} else {
  console.log(`更新 ${DOC_PATH} 代码...`);
  shelljs.exec(`cd ${DOC_PATH} && git pull`);
}

module.exports = function () {
  let filelist = [];
  walkSync(DOC_PATH, filelist);
  fs.writeFileSync('./web/data/docs.json', JSON.stringify(filelist), 'utf-8')
  return 'doc 更新成功!';
}
