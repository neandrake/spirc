var Log = require('../util/log.js').Log;
var req = require('../core/requests.js'),
	Nick = req.Nick,
	Pass = req.Pass,
	Quit = req.Quit,
	User = req.User;

module.exports = (function clientopts_export() {
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
		this.sendsPerSec = 4;
		this.log = new Log(process.stdout);

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
			return new User(
				this.username,
				this.hostname,
				this.servername,
				this.realname
			);
		},
		getNickCommand: function() {
			this._altNickIterator = 0;
			return new Nick(this.nick);
		},
		getPassCommand: function() {
			if (this.pass != null) {
				return new Pass(this.pass);
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
				return new Nick(altnick);
			}
			return new Quit();
		}
	};

	return {
		ClientOpts: ClientOpts
	};
})();
