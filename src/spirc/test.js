var net  = require('net');
var util = require('util');
var client = require('./client.js');
var cmd = require('./commands.js');


var c = new client.Client({
	server: 'napoleon.mimsoftware.com',
	nick: 'gewn'
});

c.on('onConnected', function() {
	console.log("> Connected to " + this.opts.server + ":" + this.opts.port);
	c.register();
});
c.on('onError', function(err) {
	console.log("> Error: " + err);
});
c.on('onDisconnect', function() {
	console.log("> Disconnected from " + this.opts.server);
})

process.on('SIGINT', function() {
	c.disconnect();
});

c.server.onAnyResponse(function(response) {
	var readable = response.readable();
	if (readable == '');
	readable = response.type;
	console.log(this.name + "> " + readable);
});

c.user.onAnyResponse(function(response) {
	var readable = response.readable();
	if (readable == '');
	readable = response.type;
	console.log(this.name + "> " + readable);
});

c.user.once('MODE', function() {
	c.target('#mim').join();
	c.target('#mim').say('hi');
	c.target('#mim').say('bye');
	c.target('#mim').part();
	c.server.quit();
});

c.connect();
