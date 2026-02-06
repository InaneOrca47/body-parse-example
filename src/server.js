const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.log(err);
    request.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();



    if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (request.headers['content-type'] === 'application/json') {
      request.body = JSON.parse(bodyString);
    }
    else {
      response.status = 400;
      response.end();
      return;
    }



    handler(request, response);
  });
}

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else {
    htmlHandler.getIndex(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }

};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
