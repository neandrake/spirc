var eventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var TokenReader = require('../util/tokread.js').TokenReader;

var req = require('./requests.js'),
	Join = req.Join,
	Part = req.Part,
	PrivMsg = req.PrivMsg,
	Quit = req.Quit;

module.exports = (function targets_export() {
	var Target = function(client, name) {
		this.client = client;
		this.name = name;
	};
	inherits(Target, eventEmitter);

	Target.prototype.onInbound = function onInbound(callback) {
		this.client.on('inbound', callback);
	};

	Target.prototype.say = function say(msg) {
		this.client.send(new PrivMsg(this.name, msg));
	};

	Target.prototype.onSaid = function onSaid(callback) {
		this.on(':PRIVMSG', callback);
	};

	Target.prototype.pipe = function pipe(stream) {
		var self = this;
		var tr = new TokenReader(stream);
		tr.on('token', function _cb_onLinePipe(line) {
			self.say(line);
		});
	};

	var Host = function Host(client, name) {
		Target.call(this, client, name);
	};
	inherits(Host, Target);

	Host.prototype.quit = function quit(msg) {
		this.client.send(new Quit(msg));
	};

	Host.prototype.onPing = function onPing(callback) {
		this.on(':PING', callback);
	};

	var User = function User(client, name) {
		Target.call(this, client, name);
	};
	inherits(User, Target);

	var Channel = function Channel(client, name) {
		Target.call(this, client, name);
	};
	inherits(Channel, Target);
	Channel.startTokens = ['#', '&', '!', '+'];
	Channel.charLimit = 50;
	Channel.illegalTokens = [' ', ',', String.fromCharCode(7)];

	Channel.prototype.join = function join() {
		this.client.send(new Join(this.name));
	};

	Channel.prototype.part = function part(msg) {
		this.client.send(new Part(this.name, msg));
	};

	Channel.isValidChannelName = function isValidChannelName(name) {
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
			if (name.indexOf(Channel.illegalTokens[p]) > -1) {
				return false;
			}
		}
		return true;
	};

	return {
		Channel: Channel,
		Host: Host,
		Target: Target,
		User: User
	};
})();
