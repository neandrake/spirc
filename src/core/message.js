var inherits = require('util').inherits;

module.exports = (function message_export() {
	var Prefix = function(prefix) {
		this.target = null;
		this.user = null;
		this.host = null;
		this.parse(prefix);
	};

	Prefix.prototype = {
		constructor: Prefix,
		raw: function() {
			var val = '';
			if (this.target !== undefined && this.target !== null) {
				val += ':' + this.target;
				if (this.user !== undefined && this.user !== null) {
					val += '!' + this.user;
				}
				if (this.host !== undefined && this.host !== null) {
					val += '@' + this.host;
				}
			}
			return val;
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
		this.prefix = null;
		this.middle = null;
		this.trailing = null;
		this.params = null;

		if (typeof(message) == 'object') {
			this.copy(message);
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
			if (prefix !== undefined && prefix !== null) {
				this.prefix = Prefix(prefix);
			} else {
				this.prefix = null;
			}
		},
		setMiddle: function() {
			this.params = [];
			for (var i=0, len=arguments.length; i<len; i++) {
				var arg = arguments[i];
				if (arg !== undefined && arg !== null) {
					this.params.push(arg);
				}
			}
			this.middle = this.params.join(' ');
		},
		setTrailing: function(trailing) {
			if (trailing !== undefined && trailing !== null) {
				if (trailing.indexOf(' :') != 0) {
					trailing = ' :' + trailing;
				}
				this.trailing = trailing;
			} else {
				this.trailing = null;
			}
		},
		printraw: function() {
			return this.raw().replace(Message.delim, '');
		}
	};

	var Command = function(message) {
		Message.call(this, message);
	};
	inherits(Command, Message);

	Command.prototype.setCommand = function(command) {
		if (command == null) {
			throw "Must specify a valid command";
		}
		this.command = command.toUpperCase();
	};

	Command.prototype.raw = function() {
		var val = '';
		if (this.prefix !== undefined && this.prefix !== null) {
			val += this.prefix.raw();
			val += ' ';
		}
		val += this.command;
		if (this.middle !== undefined && this.middle !== null) {
			val += ' ' + this.middle;
		}
		if (this.trailing !== undefined && this.trailing !== null) {
			val += this.trailing;
		}
		val += Message.delim;
		return val;
	};

	var Response = function(response) {
		this.type = null;
		this._rawline = null;

		Message.call(this, response);
		if (typeof(response) == 'string') {
			this.parse(response);
		}
	};
	inherits(Response, Message);

	Response.prototype.parse = function(line) {
		this._rawline = line;
		var len = line.length;
		var nextSpaceIndex = -1;

		var curSpaceIndex = line.indexOf(' ');
		var prefixIndex = line.indexOf(':');
		if (prefixIndex == 0) {
			this.prefix = new Prefix(line.substring(0, curSpaceIndex));
			line = line.substring(curSpaceIndex);
		}

		curSpaceIndex = 0;
		while (line.charAt(curSpaceIndex) == ' ') {
			curSpaceIndex++;
		}

		nextSpaceIndex = line.indexOf(' ', curSpaceIndex + 1);
		if (nextSpaceIndex != -1) {
			this.type = line.substring(curSpaceIndex, nextSpaceIndex);
		} else {
			this.type = line.substring(curSpaceIndex);
		}

		curSpaceIndex = nextSpaceIndex;
		if (curSpaceIndex < 0) {
			return;
		}

		while (curSpaceIndex < len && line.charAt(curSpaceIndex) == ' ') {
			curSpaceIndex++;
		}
		curSpaceIndex--;

		var trailIndex = line.indexOf(' :', curSpaceIndex);
		if (trailIndex != -1) {
			this.trailing = line.substring(trailIndex + 2);
		} else {
			trailIndex = line.lastIndexOf(' ');
			if (trailIndex != -1 && trailIndex > curSpaceIndex) {
				this.trailing = line.substring(trailIndex + 1);
			}
		}

		if (curSpaceIndex < trailIndex) {
			this.middle = line.substring(curSpaceIndex + 1, trailIndex);
		}

		if (this.middle != null) {
			this.params = [];
			var last = 0;
			var index = 0;
			var len = this.middle.length;
			while (index < len) {
				if (this.middle.charAt(index) == ' ') {
					this.params.push(this.middle.substring(last, index));
					last = index + 1;
				}
				index++;
			}
			if (last != len) {
				this.params.push(this.middle.substring(last));
			}
			if (this.trailing != null) {
				this.params.push(this.trailing);
			}
		}
	};

	Response.prototype.readable = function() {
		var readable = '';
		if (this.middle != null) {
			readable += this.middle;
			if (this.trailing != null) {
				readable += ' ';
			}
		}
		if (this.trailing != null) {
			readable += this.trailing;
		}
		return readable;
	};

	Response.prototype.raw = function() {
		var val = '';
		if (this.prefix !== undefined && this.prefix !== null) {
			val += this.prefix.raw();
			val += ' ';
		}
		
		if (this.cmdcode != null) {
			val += this.cmdcode;
		} else if (this.cmdtype != null) {
			val += this.cmdtype;
		}

		if (this.middle != null) {
			val += ' ' + this.middle;
		}
		if (this.trailing != null) {
			val += ' :' + this.trailing;
		}
		val += Message.delim;
		return val;
	};

	return {
		Command: Command,
		MessageDelim: Message.delim,
		Response: Response
	};
})();
