var cmd = require('./commands.js');

var ClientOpts = function(opts) {
	this.server = 'irc.freenode.net';
	this.port = 6667;
	this.nick = null;
	this.pass = null;
	this.altnicks = [];

	this.username = 'username';
	this.hostname = '127.0.0.1';
	this.servername = '127.0.0.1';
	this.realname = 'realname';
	this.secure = false;

	this.autoPong = true;
	this.autoAltNick = true;
	this.autoRegister = true;
	this.logStream = null;
	this.sendsPerSec = 3;

	this._sendsPerSecCount = 0;
	this._altNickIterator = -1;

	if (typeof(opts) == 'object') {
		var keys = Object.keys(this);
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			if (opts[k] !== undefined) {
				this[k] = opts[k];
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
		this._altNickIterator = 0;
		return new cmd.Nick(this.nick);
	},
	getPassCommand: function() {
		if (this.pass != null) {
			return new cmd.Pass(this.pass);
		}
		return null;
	},
	getAltNickCommand: function() {
		this._altNickIterator++;
		if (this.altnicks.length < this._altNickIterator) {
			return null;
		}
		var altnick = this.altnicks[this._altNickIterator];
		if (altnick != null) {
			this._altNickIterator++;
			return new cmd.Nick(altnick);
		}
		return new cmd.Quit();
	}
};

exports.ClientOpts = ClientOpts;
