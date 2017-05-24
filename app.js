const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env,
      urlLib       = require('url'),
      FirebaseService = require('./firebase-service');

let server = http.createServer(function (request, response) {
    let url = request.url.split('?')[0];
    var query = urlLib.parse(request.url, true).query;
    console.log(url)
    console.log(query)
    if (url == '/') {
      url += 'index.html';
    }
    if(url == '/sendReply') {
        var authToken = query.authToken;
        FirebaseService.validateAuth(authToken, function(isAuthenticated, message) {
            response.writeHead(200);
            response.end(JSON.stringify(message));
        })
    } else if (url == '/health') {
        response.writeHead(200);
        response.end();
    } else if (url == '/info/gen' || url == '/info/poll') {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-cache, no-store');
        response.end(JSON.stringify(sysInfo[url.slice(6)]()));
    } else {
        fs.readFile('./static' + url, function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end('Not found');
            } else {
                let ext = path.extname(url).slice(1);
                if (contentTypes[ext]) {
                    response.setHeader('Content-Type', contentTypes[ext]);
                }
                if (ext === 'html') {
                    response.setHeader('Cache-Control', 'no-cache, no-store');
                }
                response.end(data);
            }
        });
    }
});

server.listen(env.NODE_PORT || 3030, env.NODE_IP || 'localhost', function () {
    console.log(`Application worker ${process.pid} started...`);
});
