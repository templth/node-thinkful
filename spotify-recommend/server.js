var http = require('http');
var https = require('https');
var events = require('events');
var querystring = require('querystring');
var static = require('node-static');

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    var options = {
        host: 'api.spotify.com',
        path: '/v1/' + endpoint + '?' + querystring.stringify(args)
    };
    var item = '';
    var searchReq = https.get(options, function(response) {
        response.on('data', function(chunk) {
            item += chunk;
        });
        response.on('end', function() {
            item = JSON.parse(item);
            emitter.emit('end', item);
        });
        response.on('error', function() {
            emitter.emit('error');
        });
    });
    return emitter;
};

var getRelatedArtists = function(res, artist){
    var related_url = 'artists/' + artist.id + '/related-artists';
    var relatedReq = getFromApi(related_url, {
    });     

    relatedReq.on('end', function(related_item){
        artist.related = related_item.artists;
        res.end(JSON.stringify(artist));
    });

    relatedReq.on('error', function() {
        res.statusCode = 404;
        res.end();
    });
};


var fileServer = new static.Server('./public');
var server = http.createServer(function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.method == "GET" && req.url.indexOf('/search/') === 0) {
        var name = req.url.split('/')[2];
        var searchReq = getFromApi('search', {
            q: name,
            limit: 1,
            type: 'artist'
        });

        searchReq.on('end', function(item) {
            var artist = item.artists.items[0];
            getRelatedArtists(res, artist);
        });

        searchReq.on('error', function() {
            res.statusCode = 404;
            res.end();
        });
    }
    else {
        fileServer.serve(req, res);
    }
});

server.listen(8080);
