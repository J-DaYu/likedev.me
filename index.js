const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-better-router');
const staticServer = require('koa-static');
const sha1 = require('js-sha1');
var bodyParser = require('koa-bodyparser');
const bufferEq = require('buffer-equal-constant-time')

const HOOK_CONFIG = require('./hook.config');
const PORT = 3000;
const WEB_PATH = './web/source';
const crypto = require('crypto');

function sign (secret, data) {
  return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex')
}

function verify (signature, secret, data) {
  return bufferEq(Buffer.from(signature), Buffer.from(sign(secret, data)))
}

let app = new Koa();
app.use(bodyParser());

// router
let router = Router().loadMethods();
router.get('*', (ctx, next) => {
  ctx.body = 'Hello Koa2!';
});

// TODO 自动化脚本 / 更新 web 源码 / 编译源码 /更新 docs 文档
let deploy = Router({ prefix: '/deploy' }).loadMethods();
deploy.post('/doc', (ctx, next) => {
  let signature = ctx.headers['x-hub-signature'];
  if (!signature) {
    ctx.body = 'x-hub-signature 必须传入';
  } else if (!verify(signature, HOOK_CONFIG.doc_hook_secret, ctx.request.rawBody)) {
    ctx.body = `signature 不匹配: ${signature}`;
  } else {
    let doc = require('./deploy/doc');
    ctx.body = doc();
  }
});
deploy.post('/web', (ctx, next) => {
  let signature = ctx.headers['x-hub-signature'];
  if (!signature) {
    ctx.body = 'x-hub-signature 必须传入';
  } else if (!verify(signature, HOOK_CONFIG.web_hook_secret, ctx.request.rawBody)) {
    ctx.body = `signature 不匹配: ${signature}`;
  } else {
    let web = require('./deploy/web');
    ctx.body = web();
  }
});
deploy.get('/test', (ctx, next) => {
  //
  let res = {
    github: '0d3d61284b8450f3ed8f6bc3200b80a55ccd931e',
    hex: sha1.hex(HOOK_CONFIG.doc_hook_secret),
    sha1: sha1(HOOK_CONFIG.doc_hook_secret),
    crypto: crypto.createHmac('sha1', HOOK_CONFIG.doc_hook_secret).digest('hex')
  }
  ctx.body = JSON.stringify(res);
});

// app.use(staticServer('./web/source/dist'));
app.use(router.middleware());
app.use(deploy.middleware());

app.listen(PORT, () => {
  console.log(`fun with koa at port ${PORT}`);
})
