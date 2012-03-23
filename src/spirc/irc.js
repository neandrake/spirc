var net  = require('net');
var util = require('util');
var client = require('./client.js');
var cmd = require('./commands.js');


var c = new client.Client();
c.addListener('onConnected', function() {
	console.log("> Connected to " + this.opts.server + ":" + this.opts.port);
	c.send(new cmd.Nick('jnitro'));
	c.send(new cmd.User('jnitro', this.opts.server, '10.0.0.1', 'jnitro'));
});
c.addListener('onError', function(err) {
	console.log("> Error: " + err);
});
c.addListener('onMessageReceived', function(msg) {
	console.log(msg.readable());
});
c.addListener('onDisconnect', function() {
	console.log("> Disconnected from " + this.opts.server);
})

process.on('SIGINT', function() {
	c.disconnect();
});
c.connect();
