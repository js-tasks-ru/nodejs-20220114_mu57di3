const http = require('http');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

const server = new http.Server();

const fileReader = (filePath, response) => {
  const stat = fs.statSync(filePath);
  let mime;

  switch (path.extname(filePath)) {
    case '.png':
      mime = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      mime = 'image/jpeg';
      break;
    default:
      mime = 'text';
      break;
  }

  response.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
  });

  stream.pipeline(
      fs.createReadStream(filePath),
      response,
      (err)=>{
        if (err) {
          response.statusCode = 500;
        }
        response.end();
      },
  );
};

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.indexOf('/') > -1) {
    res.statusCode = 400;
    res.end();
    return;
  }

  if (!fs.existsSync(filepath)) {
    res.statusCode = 404;
    res.statusMessage = 'File not found.';
    res.end();
    return;
  }

  switch (req.method) {
    case 'GET':
      fileReader(filepath, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
