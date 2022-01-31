const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let stack = new Set();

router.get('/subscribe', async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache,must-revalidate');
  const promise = new Promise((resolve, reject) => {
    stack.add(resolve);

    ctx.res.on('close', () => {
      stack.delete(resolve);
      const error = new Error('Connection closed');
      error.code = 'ECONNRESET';
      reject(error);
    });
  });

  let message;

  try {
    message = await promise;
  } catch (err) {
    if (err.code === 'ECONNRESET') return;
    throw err;
  }
  ctx.body = message;
  await next();
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400);
  }

  stack.forEach((resolve) => {
    resolve(String(message));
  });

  stack = new Set();

  ctx.body = 'ok';
  await next();
});

app.use(router.routes());

module.exports = app;
