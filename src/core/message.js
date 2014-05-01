var inherits = require('util').inherits;

module.exports = (function message_export() {
	var Prefix = function(prefix) {
		this._rawline = null;
		this.target = null;
		this.user = null;
		this.host = null;
		this.parse(prefix);
	};

	Prefix.prototype = {
		constructor: Prefix,

		rawline: function() {
			if (this._rawline != null) {
				return this._rawline;
			}

			this._rawline = '';
			if (this.target != null) {
				this._rawline = ':' + this.target;
				if (this.user != null) {
					this._rawline += '!' + this.user;
				}
				if (this.host != null) {
					this._rawline += '@' + this.host;
				}
			}
			return this._rawline;
		},

		parse: function(prefix) {
			if (prefix == null) {
				return;
			}
			var index = prefix.indexOf(':');
			if (index != 0) {
				return;
			}
			prefix = prefix.substring(1);

			index = prefix.indexOf('@');
			if (index != -1) {
				this.host = prefix.substring(index + 1);
				prefix = prefix.substring(0, index);
			}

			index = prefix.indexOf('!');
			if (index != -1) {
				this.user = prefix.substring(index + 1);
				prefix = prefix.substring(0, index);
			}
			this.target = prefix;
		}
	};

	var Message = function(message) {
		this._rawline = null;
		this.prefix = null;
		this.command = null;
		this.middle = null;
		this.trailing = null;

		if (typeof(message) == 'object') {
			this.copy(message);
		} else if (typeof(message) == 'string') {
			this.parse(message);
		}
	};

	Message.delim = '\r\n';

	Message.prototype = {
		constructor: Message,

		copy: function(msg) {
			var keys = Object.keys(this);
			for (var i=0; i<keys.length; i++) {
				var k = keys[i];
				if (msg[k] !== undefined) {
					this[k] = msg[k];
				}
			}
		},

		setPrefix: function(prefix) {
			if (prefix != null) {
				this.prefix = new Prefix(prefix);
			} else {
				this.prefix = null;
			}
		},

		setCommand: function(command) {
			this.command = command.toUpperCase();
		},

		setParams: function() {
			this.middle = [];
			this.trailing = null;

			for (var i=0, len=arguments.length; i<len; i++) {
				var arg = arguments[i];
				if (arg == null) {
					continue;
				}
				if (i == (len - 1)) {
					if (arg.charAt(0) != ':') {
						arg = ':' + arg;
					}
					this.trailing = arg;
				} else {
					this.middle.push(arg);
				}
			}
		},

		rawline: function() {
			if (this._rawline != null) {
				return this._rawline;
			}

			this._rawline = '';
			if (this.prefix != null) {
				this._rawline += this.prefix.rawline();
				this._rawline += ' ';
			}
			this._rawline += this.command;
			if (this.middle != null) {
				this._rawline += ' ' + (this.middle.join(' '));
			}
			if (this.trailing != null) {
				this._rawline += ' ' + this.trailing;
			}
			this._rawline += Message.delim;
			return this._rawline;
		},

		parse: function(message) {
			this._rawline = message;
			var len = message.length;
			var nextSpaceIndex = -1;

			var curSpaceIndex = message.indexOf(' ');
			var prefixIndex = message.indexOf(':');
			if (prefixIndex == 0) {
				this.prefix = new Prefix(message.substring(0, curSpaceIndex));
				message = message.substring(curSpaceIndex);
			}

			curSpaceIndex = 0;
			while (message.charAt(curSpaceIndex) == ' ') {
				curSpaceIndex++;
			}

			nextSpaceIndex = message.indexOf(' ', curSpaceIndex + 1);
			if (nextSpaceIndex < 0) {
				nextSpaceIndex = message.indexOf('\r\n', curSpaceIndex + 1);
			}
			this.command = message.substring(curSpaceIndex, nextSpaceIndex);

			curSpaceIndex = nextSpaceIndex;

			while (curSpaceIndex < len && message.charAt(curSpaceIndex) == ' ') {
				curSpaceIndex++;
			}
			curSpaceIndex--;

			var trailIndex = message.indexOf(' :', curSpaceIndex);
			if (trailIndex > -1) {
				this.trailing = message.substring(trailIndex + 2);
			}
			
			if (trailIndex > 0) {
				this.middle = message.substring(curSpaceIndex + 1, trailIndex).split(' ');
			} else {
				this.middle = message.substring(curSpaceIndex + 1).split(' ');
			}
		}
	};

	var Outbound = function() {
		Message.apply(this, arguments);
		this.sentTimestamp = -1;
		this.responseCommands = [];
	};
	inherits(Outbound, Message);

	Outbound.prototype.setResponseCommands = function() {
		this.expectedResponses = Array.prototype.slice.call(arguments);
	};

	var Inbound = function() {
		Message.apply(this, arguments);
		this.recvTimestamp = -1;
	};
	inherits(Inbound, Message);

	return {
		Message: Message,
		Inbound: Inbound,
		Outbound: Outbound
	};
})();
