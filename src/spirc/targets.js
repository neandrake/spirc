var util = require('util');
var cmd = require('./commands.js');
var tokread = require('./tokenreader.js');

var Target = function(client, name) {
	this.client = client;
	this.name = name;
};
util.inherits(Target, process.EventEmitter);
Target.prototype.onAnyResponse = function(callback) {
	this.on('_anyResponse', callback);
};
Target.prototype.say = function(msg) {
	this.client.send(new cmd.PrivMsg(this.name, msg));
};
Target.prototype.onSaid = function(callback) {
	this.on('PRIVMSG', callback);
};
Target.prototype.pipe = function(stream) {
	var self = this;
	var tr = new tokread.TokenReader(stream);
	tr.on('token', function(line) {
		self.say(line);
	});
};

var User = function(client, name) {
	Target.call(this, client, name);
};
util.inherits(User, Target);

var Channel = function(client, name) {
	Target.call(this, client, name);
};
util.inherits(Channel, Target);
Channel.prototype.join = function() {
	this.client.send(new cmd.Join(this.name));
};
Channel.prototype.part = function(msg) {
	this.client.send(new cmd.Part(this.name, msg));
};

var Host = function(client, name) {
	Target.call(this, client, name);
};
util.inherits(Host, Target);
Host.prototype.quit = function(msg) {
	this.client.send(new cmd.Quit(this.name, msg));
};

Channel.startTokens = ['#', '&', '!', '+'];
Channel.charLimit = 50;
Channel.illegalTokens = [' ', ',', String.fromCharCode(7)];
Channel.isValidChannelName = function(name) {
	var hasValidStartToken = false;
	var p, plen;
	for (p=0, plen=Channel.startTokens.length; p<plen; p++) {
		if (name.indexOf(Channel.startTokens[p]) == 0) {
			hasValidStartToken = true;
			break;
		}
	}
	if (!hasValidStartToken) {
		return false;
	}

	for (p=0, plen=Channel.illegalTokens.length; p<plen; p++) {
		if (name.indexOf(Channel.illegalTokens[p]) != -1) {
			return false;
		}
	}
	return true;
};

exports.Target = Target;
exports.User = User;
exports.Channel = Channel;
exports.Host = Host;
