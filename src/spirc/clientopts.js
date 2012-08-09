var cmd = require('./commands.js');

var ClientOpts = function(opts) {
	var self = this;
	self.server = 'irc.freenode.net';
	self.port = 6667;
	self.nick = null;
	self.pass = null;
	self.altnicks = [];

	self.username = 'username';
	self.hostname = '127.0.0.1';
	self.servername = '127.0.0.1';
	self.realname = 'realname';

	self.autoPong = true;
	self.autoAltNick = true;
	self._altnick_iterator = 0;

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
		this._altnick_iterator = 0;
		return new cmd.Nick(this.nick);
	},
	getPassCommand: function() {
		if (this.pass != null) {
			return new cmd.Pass(this.pass);
		}
		return null;
	},
	getAltNickCommand: function() {
		if (this.altnicks.length < this._altnick_iterator) {
			return null;
		}
		var altnick = this.altnicks[this._altnick_iterator];
		if (altnick != null) {
			this._altnick_iterator++;
			return new cmd.Nick(altnick);
		}
		return new cmd.Quit();
	}
};

exports.ClientOpts = ClientOpts;
