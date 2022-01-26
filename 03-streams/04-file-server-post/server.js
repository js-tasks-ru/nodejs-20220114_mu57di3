const http = require('http');
const path = require('path');
const fs = require('fs');
const server = new http.Server();
const LimitSizeStream = require('./LimitSizeStream.js');
const LimitExceededError = require('./LimitExceededError');

const ONE_MB = 1024*1024;

const fileWriter = function(filePath, request, response) {
  const writeStream = fs.createWriteStream(filePath);
  const limitStream = new LimitSizeStream({limit: ONE_MB});

  request
      .pipe(limitStream)
      .on('error', (error)=>{
        if (error instanceof LimitExceededError) {
          response.statusCode = 413;
          response.end(error.code);
        } else if (error) {
          response.statusCode = 500;
          response.end('Internal Server Error');
        }
        writeStream.destroy();
        fs.unlink(filePath, () => {
        });
      })
      .pipe(writeStream)
      .on('error', ()=>{
        response.statusCode = 500;
        response.end('Internal Server Error');
        writeStream.destroy();
        fs.unlink(filePath, () => {
        });
      }).on('finish', ()=>{
        response.statusCode = 201;
        response.end('File saved');
      });

  request.on('aborted', ()=>{
    writeStream.destroy();
    fs.unlink(filePath, () => {});
  });
};

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.indexOf('/') > -1) {
    res.statusCode = 400;
    res.end('Wrong request');
    return;
  }

  if (fs.existsSync(filepath)) {
    res.statusCode = 409;
    res.end('File exist');
    return;
  }

  switch (req.method) {
    case 'POST':
      fileWriter(filepath, req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
