var net  = require('net');
var util = require('util');
var client = require('./client.js');
var cmd = require('./commands.js');

var c = new client.Client({
	nick: 'norsefactory',
	user: 'norsefactory',
});
c.addListener('onConnected', function() {
	console.log("> Connected to " + c.opts.server + ":" + c.opts.port);
	c.send(new cmd.Nick('porse'));
	c.send(new cmd.User('porse', c.opts.server, '76.188.21.24', 'porse'));
});
c.addListener('onError', function(err) {
	console.log("> Error: " + err);
});
c.addListener('onMessageReceived', function(msg) {
	console.log(msg.print());
});
c.addListener('onDisconnect', function() {
	console.log("> Disconnected from " + c.opts.server);
})

process.on('SIGINT', function() {
	c.disconnect();
});
c.connect();
