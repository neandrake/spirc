var client = require('./client.js');
var cmd = require('./commands.js');
var tokread = require('./tokenreader.js');
var spawn = require('child_process').spawn;

var chan = "#test";
var c = new client.Client({
	nick: 'doorbot',
	altnicks: ['boorbot', 'snoorbot', 'floorbot'],
	server: 'napoleon.mimsoftware.com'
	//server: 'chat.freenode.net'
});

process.on('SIGINT', function() {
	c.disconnect();
});

c.on('onConnected', function() {
	logServerResponse("connected on port " + this.opts.port);
	c.register();
});

c.on('onError', function(err) {
	logServerResponse("error: " + err);
});

c.on('onDisconnect', function() {
	logServerResponse("disconnected");
});

c.anyOnce('001', function() {
	c.target(chan).join();
});

c.anyOnAny(function(response) {
	logResponse.call(this, response);
});

c.target(chan).onSaid(function(response) {
	var channel = c.target(response.prefix.target);
	var message = response.trailing;
	if (message.indexOf('!ffe ') == 0) {
		var eco_num = message.substring(5);
		if (!isNaN(parseInt(eco_num))) {
			var eco_files = spawn('ssh', ['octavian', 'files_for_eco', eco_num]);
			var tr = new tokread.TokenReader(eco_files.stdout);
			var first = true;
			tr.on('onTokenRead', function(line) {
				if (first) {
					channel.say("-- Files For ECO " + eco_num + " --");
				}
				first = false;
				channel.say(line);
			});
			eco_files.on('exit', function(code) {
				channel.say("-- End of Files For ECO " + eco_num + " --");
			});
		}
	}
});


c.connect();


var logServerResponse = function(message) {
	logResponse.call({name: c.opts.server}, {type:'server', readable:function(){return message;}});
};

var logResponse = function(response) {
	var from = this.name;
	if (response.prefix != null) {
		from = response.prefix.target;
	}

	if (response.type != null) {
		from += '/' + response.type;
	}

	var readable = response.readable();
	if (readable == '') {
		readable = response.type;
	}
	console.log(from + "> " + readable);
};