
var http = require('http');

var server = http.createServer(function(request, response) {
	
	var return_data;

	if(request.url == '/headers') {
		return_data = request.headers;
	}
	else if(request.url.match(/^\/headers\//)) {
		var header = request.url.split('/')[2];
		console.log(header);
		return_data = request.headers[header];
	}	
	else if(request.url == '/version') {
		return_data = request.httpVersion;
	}
	else {
		return_data = 'Valid URLs: /version, /headers, /headers/<header>';
	}

    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(return_data));
    response.end();
});

server.listen(8080);


