const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const fileRemover = (filePath, response) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.statusCode = 404;
        response.end('File not found');
      } else {
        response.statusCode = 500;
        response.end('Something wrong');
      }
    } else {
      response.end();
    }
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

  switch (req.method) {
    case 'DELETE':

      fileRemover(filepath, res);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
