var client = require('./client.js');
var cmd = require('./commands.js');

var chan = "#irctest";
var c = new client.Client({
	nick: 'doorbot',
	altnicks: ['gewnbot', 'doordoorbot'],
	//server: 'napoleon.mimsoftware.com',
	server: 'chat.freenode.net'
});

c.on('onConnected', function() {
	console.log(this.opts.server + "> connected on port " + this.opts.port);
	c.register();
});
c.on('onError', function(err) {
	console.log(this.opts.server + "> error: " + err);
});
c.on('onDisconnect', function() {
	console.log(this.opts.server + "> disconnected");
});

process.on('SIGINT', function() {
	c.disconnect();
});

c.server.onAnyResponse(function(response) {
	var readable = response.readable();
	if (readable == '') {
		readable = response.type;
	}
	if (response.type.indexOf(':') == 0) {
		console.log('?: ' + response._rawline);
	}
	console.log("{"+ this.name + "|" + response.type + "}> " + readable);
});

c.user.onAnyResponse(function(response) {
	var readable = response.readable();
	if (readable == '') {
		readable = response.type;
	}
	console.log("[" + this.name + "|" + response.type + "]> " + readable);
});

c.server.once('001', function() {
	c.target(chan).join();
});

c.target(chan).onAnyResponse(function(response) {
	var readable = response.readable();
	if (readable == '') {
		readable = response.type;
	}
	console.log("(" + response.prefix.target + "->" + this.name + "|" + response.type + ")> " + readable);
});

c.connect();
