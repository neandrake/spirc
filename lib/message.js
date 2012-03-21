
var Message = function(message) {
	this.prefix = null;
	this.command = null;
	this.middle = null;
	this.trailing = null;
	this.params = [];

	if (typeof(message) == 'string') {
		this.parse(message);
	}
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
	parse: function(message) {
		var len = message.length;
		var curSpaceIndex = 0;
		var nextSpaceIndex = -1;

		curSpaceIndex = message.indexOf(' ');
		if (message.indexOf(':') == 0) {
			this.prefix = new Prefix(message.substring(0, curSpaceIndex));
		}

		while (message.charAt(curSpaceIndex) == ' ') {
			curSpaceIndex++;
		}

		nextSpaceIndex = message.indexOf(' ', curSpaceIndex);
		if (nextSpaceIndex != -1) {
			this.command = message.substring(curSpaceIndex, nextSpaceIndex);
		} else {
			this.command = message.substring(curSpaceIndex);
		}
		curSpaceIndex = nextSpaceIndex;

		if (curSpaceIndex < 0) {
			return;
		}

		while (curSpaceIndex < len && message.charAt(curSpaceIndex) == ' ') {
			curSpaceIndex++;
		}
		curSpaceIndex--;

		var trailIndex = message.indexOf(' :', curSpaceIndex);
		if (trailIndex != -1) {
			this.trailing = message.substring(trailIndex + 2);
		} else {
			trailIndex = message.lastIndexOf(' ');
			if (trailIndex != -1 && trailIndex > curSpaceIndex) {
				this.trailing = message.substring(trailIndex + 1);
			}
		}

		if (curSpaceIndex < trailIndex) {
			this.middle = message.substring(curSpaceIndex + 1, trailIndex);
		}

		if (this.middle != null) {
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
		var firstArg = true;
		this.middle = '';
		for (var i=0, len=arguments.length; i<len; i++) {
			var arg = arguments[i];
			if (arg !== undefined && arg !== null) {
				if (!firstArg) {
					this.middle += ' ';
				}
				this.middle += arg;
				firstArg = false;
			}
		}
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
