// var qs = require('query-string');
var url = require('url');
var http = require('http');
var fs = require('fs');
/*************************************************************
You should implement your request handler function in this file.
requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.
You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.
*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.
**************************************************************/


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var baseObj = {
  results: []
};

var handler = function(request, response) {
  
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // The outgoing status.

  var headers = defaultCorsHeaders;

  response.writeHead(200, headers);

  if (request.url !== '/classes/messages') {
    response.writeHead(404, headers);
    response.end();
  } else if (request.method === 'POST' ) {
    request.on('data', function(data) {
      var sentData = JSON.parse(data);
      var hash = Math.random();
      var date = new Date();
      var dataObj = {
        text: sentData.text,
        username: sentData.username,
        createdAt: date,
        objectId: hash
      };
      //write to file
      /*fs.appendFile('messageData.txt', ',' + JSON.stringify(dataObj), function(error) {
        if (error) {
          throw error;
        }
        console.log('data appended');
      });*/
      var serverData = fs.readFileSync('messageData.txt', 'utf-8'); //read existing contents into data
      console.log(serverData);
      var fd = fs.openSync('messageData.txt', 'w+');
      var buffer = JSON.stringify(dataObj);
      fs.writeSync(fd, buffer + ',', 0, buffer.length + 1); //write new data
      fs.writeSync(fd, serverData, buffer.length + 1, serverData.length); //append old data
      //or fs.appendFile(fd, data);
      fs.close(fd);

      baseObj.results.unshift(dataObj);
      response.statusCode = 201;
      response.writeHead(response.statusCode, headers);

      response.end();
    });
    request.on('error', function(err) {
      console.log(err.stack);
    });
  } else if (request.method === 'GET') {
    //read from file

    /*fs.readFile('messageData.txt', function(error, readData) {
      if (error) {
        throw error;
      }
      var stringToSend = '{"response": [' + readData.slice(0, readData.length - 1) + ']}';
      console.log('stringified', stringToSend);
      response.end(stringToSend);
    });*/


    response.writeHead(200, headers);
    response.end(JSON.stringify(baseObj));
  } else if (request.method === 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else {
    response.writeHead(404, headers);
    response.end();
  }
  

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end('Hello, World!');
};

exports.requestHandler = handler;

