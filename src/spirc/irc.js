var net  = require('net');
var util = require('util');
var client = require('./client.js');
var cmd = require('./commands.js');


var c = new client.Client();
c.on('onConnected', function() {
	console.log("> Connected to " + this.opts.server + ":" + this.opts.port);
	c.send(new cmd.Nick('jnitro'));
	c.send(new cmd.User('jnitro', this.opts.server, '10.0.0.1', 'jnitro'));
});
c.on('onError', function(err) {
	console.log("> Error: " + err);
});
c.on('onDisconnect', function() {
	console.log("> Disconnected from " + this.server.host);
})

process.on('SIGINT', function() {
	c.disconnect();
});

c.server.on('any', function(response) {
	console.log("Server> " + response.readable());
});

c.connect();
