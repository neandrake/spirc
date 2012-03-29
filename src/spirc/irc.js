var net  = require('net');
var util = require('util');
var client = require('./client.js');
var cmd = require('./commands.js');


var c = new client.Client({
	nick: 'jnitros'
});

c.on('onConnected', function() {
	console.log("> Connected to " + this.opts.server + ":" + this.opts.port);
	c.register();
});
c.on('onError', function(err) {
	console.log("> Error: " + err);
});
c.on('onDisconnect', function() {
	console.log("> Disconnected from " + this.server.name);
})

process.on('SIGINT', function() {
	c.disconnect();
});

c.server.onAnyResponse(function(response) {
	console.log(this.name + "> " + response.readable());
});

c.user.onAnyResponse(function(response) {
	console.log(this.name + "> " + response.readable());
});

c.connect();
