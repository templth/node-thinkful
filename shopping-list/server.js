
var http = require('http');
var static = require('node-static');

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

var storage = new Storage();
storage.add('Broad beans');
storage.add('Tomatoes');
storage.add('Peppers');

var fileServer = new static.Server('./public');

var server = http.createServer(function (req, res) {

    var responseData;
    if (req.method === 'GET' && req.url === '/items') {
        responseData = JSON.stringify(storage.items);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(responseData);
    }
    else if (req.method === 'POST' && req.url === '/items') {
        var item = '';
        req.on('data', function (chunk) {
            item += chunk;
        });
        req.on('end', function () {
            try {
                item = JSON.parse(item);
                storage.add(item.name);
                res.statusCode = 201;
                res.end();
            }
            catch(e) {
                res.statusCode = 400;
                responseData = {'message': 'Invalid JSON'};
                res.end(JSON.stringify(responseData));
            }
        });
    }
    else if ( req.method === 'DELETE' && req.url.match(/^\/items\//)) {
        var delete_id = req.url.split('/')[2];
        var deleted_item = storage.delete(delete_id);

        if( deleted_item ){
            res.statusCode = 202;
            res.end(JSON.stringify(deleted_item));
        }
        else{
            res.statusCode = 400;
            responseData = {'message': 'Item not found'};
            res.end(JSON.stringify(responseData));            
        }
    }
    else if (req.method === 'PUT' && req.url.match(/^\/items\//)) {

        var update_id = req.url.split('/')[2];
        var update_item = '';

        req.on('data', function (chunk) {
            update_item += chunk;
        });
        req.on('end', function () {
            try {
                update_item = JSON.parse(update_item);
                var updated_item = storage.edit(update_item.id, update_item.name);
                res.statusCode = 200;
                res.end(JSON.stringify(updated_item));
            }
            catch(e) {
                res.statusCode = 400;
                responseData = {'message': 'Invalid JSON'};
                res.end(JSON.stringify(responseData));
            }
        });
    }
    else {
        fileServer.serve(req, res);
    }
});

server.listen(8080, function() {
    console.log('listening on localhost:8080');
});
