
var http = require('http');
var xml2js = require('xml2js');
var jsyaml = require('js-yaml');
var nodestatic = require('node-static');

var Storage = function() {
    this.items = [];
    this.id = 0;
};

Storage.prototype.add = function(name) {
    var item = {name: name, id: this.id};
    this.items.push(item);
    this.id += 1;
    return this.id;
};

Storage.prototype.delete = function(id) {
    var found_item;
    for(var i=0; i<this.items.length; i++){
        if( this.items[i].id === parseInt(id) ){
            found_item = this.items[i];
            this.items.splice(i, 1);
        }
    }
    return found_item;
};

Storage.prototype.edit = function(id, name) {
    for(var i=0; i<this.items.length; i++){
        if( this.items[i].id === parseInt(id) ){
            this.items[i].name = name;
            return this.items[i];
        }
    }
    // We need to create a new item with the specified id
    var new_id = this.add(name);
    return this.items[new_id];
};


var configuration = {
    GET: function(req, res){
        if(req.url === '/items'){
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(storage.items));     
        }
        else{
            fileServer.serve(req, res);   
        }
    },
    POST: function(req, res){
        if(req.url === '/items'){
            var item = '';

            req.on('data', function (chunk) {
                item += chunk;
            });

            req.on('end', function () {
                var item_obj = parsePayload(req, res, item);
                storage.add(item_obj.name);
                res.statusCode = 201;
                res.end();
            });            
        }

    },
    DELETE: function(req, res){
            if(req.url.match(/^\/items\//)){
            var delete_id = req.url.split('/')[2];
            var deleted_item = storage.delete(delete_id);

            if( deleted_item ){
                res.statusCode = 202;
                res.end(JSON.stringify(deleted_item));
            }
            else{
                sendErrorResponse(res, JSON.stringify({'message': 'Item not found'}));            
            }            
        }
    },
    PUT: function(req, res){
        if(req.url.match(/^\/items\//)){
            var update_id = req.url.split('/')[2];
            var update_item = '';

            req.on('data', function (chunk) {
                update_item += chunk;
            });
            req.on('end', function () {
                var item_obj = parsePayload(req, res, update_item);
                storage.edit(item_obj.id, item_obj.name);
                res.statusCode = 201;
                res.end();
            });            
        }
    }
};

function parsePayload(req, res, data){
    if(req.headers['content-type'] == 'application/json'){
        try {
            return JSON.parse(data);
        }
        catch(e) {
            sendErrorResponse(res, JSON.stringify({'message': 'Invalid JSON'}));
        }    
    }
    else if(req.headers['content-type'] == 'application/xml'){
        try {
            var parser = new xml2js.Parser();
            parser.parseString(data, function(err,result){
                return result.data;
            });
        }
        catch(e) {
            sendErrorResponse(res, JSON.stringify({'message': 'Invalid XML'}));
        }
    }
    else if(req.headers['content-type'] == 'application/x-yaml'){
        try {
            return yaml.safeLoad(data);
        }
        catch(e) {
            sendErrorResponse(res, JSON.stringify({'message': 'Invalid YAML'}));
        }
    }
}

function sendErrorResponse(res, message){
    res.statusCode = 400;
    res.end(message);
}

var storage = new Storage();
storage.add('Broad beans');
storage.add('Tomatoes');
storage.add('Peppers');

var fileServer = new nodestatic.Server('./public');

var server = http.createServer(function (req, res) {
    var handler = configuration[req.method];
    if(handler !== null){
        handler(req, res);
    }
});

server.listen(8080, function() {
    console.log('listening on localhost:8080');
});
