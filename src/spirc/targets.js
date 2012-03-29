var util = require('util');

var Target = function(name) {
	this.name = name;
};
util.inherits(Target, process.EventEmitter);
Target.prototype.onAny = function(callback) {
	this.on('any', callback);
};

var User = function(name) {
	Target.call(this, name);
};
util.inherits(User, Target);

var Channel = function(name) {
	Target.call(this, name);
};
util.inherits(Channel, Target);

var Host = function(name) {
	Target.call(this, name);
};
util.inherits(Host, Target);

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
		if (name.indexOf(illegalChar) != -1) {
			return false;
		}
	}
	return true;
};

exports.Target = Target;
exports.User = User;
exports.Channel = Channel;
exports.Host = Host;
