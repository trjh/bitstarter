var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    var def = 'Hello World 2!';
    var file = fs.readFileSync("index.html");
    // i don't know how to catch exceptions yet, but this will at least ensure
    // we write something, instead of nothing.
    if (!file.length) {
	file = def;
    }   
    response.send(file.toString('utf8'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
