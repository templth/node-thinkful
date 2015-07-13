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
    var relatedUrl = 'artists/' + artist.id + '/related-artists';
    var relatedReq = getFromApi(relatedUrl, {
    });     

    relatedReq.on('end', function(relatedArtists){
        artist.related = relatedArtists.artists;
        //var relatedArtistsArray = [];
        //for(var i=0; i<relatedArtists.artists.length; i++){
         //   relatedArtistsArray.push(relatedArtists.artists[i]);
        //}
        getTopTracks(res, artist, relatedArtists.artists);
    });

    relatedReq.on('error', function() {
        res.statusCode = 404;
        res.end();
    });
};

var getTopTracks = function(res, artist, relatedArtists){
    var completed = 0;
    var checkCompleted = function(){
        if(completed === relatedArtists.length){
            res.statusCode = 200;
            res.end(JSON.stringify(artist));
        }
    };

    relatedArtists.forEach(function(relatedArtist){
        var tracksUrl = 'artists/' + relatedArtist.id + '/top-tracks';
        var tracksReq = getFromApi(tracksUrl, {
            country: 'US'
        });

        tracksReq.on('end', function(tracksItem){
            relatedArtist.tracks = tracksItem.tracks;
            completed += 1;
            checkCompleted();
        });

        tracksReq.on('error', function(){
            console.log('No top tracks found for' + artist.name);
            // Should we return any error here or simply not list tracks?
        });
    });
};


var fileServer = new static.Server('./public');
var server = http.createServer(function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.method == "GET" && req.url.indexOf('/search/') === 0) {
        var name = decodeURI(req.url.split('/')[2]);
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
