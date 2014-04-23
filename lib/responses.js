var util = require('util');
var msg = require('./message.js');

var Response = function(response) {
	this.type = null;
	this._rawline = null;

	msg.Message.call(this, response);
	if (typeof(response) == 'string') {
		this.parse(response);
	}
};
util.inherits(Response, msg.Message);
Response.prototype.parse = function(line) {
	this._rawline = line;
	var len = line.length;
	var nextSpaceIndex = -1;

	var curSpaceIndex = line.indexOf(' ');
	var prefixIndex = line.indexOf(':');
	if (prefixIndex == 0) {
		this.prefix = new msg.Prefix(line.substring(0, curSpaceIndex));
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
	val += msg.Message.delim;
	return val;
};


exports.Response = Response;
