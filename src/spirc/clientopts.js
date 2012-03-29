var cmd = require('./commands.js');

var ClientOpts = function(opts) {
	var self = this;
	self.server = 'irc.freenode.net';
	self.port = 6667;
	self.nick = null;
	self.pass = null;

	self.username = 'username';
	self.hostname = '10.0.0.1';
	self.servername = '10.0.0.1';
	self.realname = 'realname';

	if (typeof(opts) == 'object') {
		var keys = Object.keys(self);
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			if (opts[k] !== undefined) {
				self[k] = opts[k];
			}
		}
	}
};
ClientOpts.prototype = {
	constructor: ClientOpts,
	getUserCommand: function() {
		return new cmd.User(
			this.username,
			this.hostname,
			this.servername,
			this.realname
		);
	},
	getNickCommand: function() {
		return new cmd.Nick(this.nick);
	},
	getPassCommand: function() {
		if (this.pass != null) {
			return new cmd.Pass(this.pass);
		}
		return null;
	}
};

exports.ClientOpts = ClientOpts;
