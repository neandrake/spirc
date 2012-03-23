
var Message = function(message) {
	this.prefix = null;
	this.middle = null;
	this.trailing = null;
	this.params = null;

	if (typeof(message) == 'object') {
		this.copy(message);
	}
};
Message.prototype = {
	constructor: Message,
	raw: function() {
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
			val += ' :' + this.trailing;
		}
		val += Message.delim;
		return val;
	},
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
	setCommand: function(command) {
		if (command !== undefined && command !== null) {
			this.command = command.toUpperCase();
			return;
		}
		throw "Must specify a valid command";
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
	print: function() {
		return this.raw().replace(Message.delim, '');
	}
};
Message.delim = '\r\n';


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
			this.host = prefix.substring(index);
			prefix = prefix.substring(0, index);
		}

		index = prefix.indexOf('!');
		if (index != -1) {
			this.user = prefix.substring(index);
			prefix = prefix.substring(0, index);
		}
		this.target = prefix;
	}
};


exports.Message = Message;
exports.Prefix = Prefix;