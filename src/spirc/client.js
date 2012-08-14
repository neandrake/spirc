var net  = require('net');
var util = require('util');
var tokread = require('./tokenreader.js');
var cliopt = require('./clientopts.js');
var msg = require('./message.js');
var rsp = require('./responses.js');
var targets = require('./targets.js');
var cmd = require('./commands.js');

var Client = function(opts) {
	this.opts = new cliopt.ClientOpts(opts);
	this.server = new targets.Host(this, opts.server);
	this.user = new targets.User(this, opts.nick);
	this._anyTarget = new targets.Target(this, null);
	this.commandQueue = [];
	this.lastCommandSent = null;
	this.lastResponseRecv = null;
	this.targets = {};

	var self = this;
	self.on('connect', function() {
		self._logServerResponse('connected');
		self.register();
	});

	self.on('error', function(err) {
		self._logServerResponse('error: ' + err);
	});

	self.on('disconnect', function() {
		self._logServerResponse('disconnected');
	});

	self.anyOnce('001', function() {
		self.emit('register');
	});

	self.anyOnAny(function(response) {
		self._log(response);
	});

	self.on('_receive', self._onResponseReceived);
	self.on('_request', self._onCommandRequest);
};
util.inherits(Client, process.EventEmitter);

Client.prototype.conn = null;

Client.prototype.connect = function(callback) {
	var self = this;

	self.conn = net.Socket();
	self.conn.setTimeout(0);
	self.conn.setEncoding('utf-8');

	self.conn.on('connect', function() {
		self.emit('connect');
	});

	self.conn.on('end', function() {
		self.emit('disconnect');
	});

	self.conn.on('close', function(hadError) {
		self.emit('close');
	});

	self.conn.on('error', function(errobj) {
		self.emit('error', errobj);
	});

	var lineReader = new tokread.TokenReader(self.conn, {delimiter: msg.Message.delim});
	lineReader.on('token', function(token) {
		self.emit('_receive', token);
	});

	self.conn.connect(self.opts.port, self.opts.server);
};

Client.prototype.target = function(name) {
	return this._getTarget(name);
};

Client.prototype.hasTarget = function(name) {
	return this.targets[name] != null;
};

Client.prototype.disconnect = function() {
	this.server.quit();
	this.conn.end();
};

Client.prototype.send = function(command) {
	if (command != null) {
		this.commandQueue.push(command);
	}
	this.emit('_request');
};

Client.prototype._onResponseReceived = function(line) {
	var response = new rsp.Response(line);
	response.recvTimestamp = new Date();
	this.lastResponseRecv = response;

	var target = this.server;
	if (response.middle != null && this.hasTarget(response.middle)) {
		target = this.target(response.middle);
	}

	var type = response.type;
	if (type != null) {
		target.emit(type, response);
		this._anyTarget.emit(type, response);
	}
	target.emit('_anyResponse', response);
	this._anyTarget.emit('_anyResponse', response);
};

Client.prototype.anyOn = function(event, callback) {
	var self = this;
	this._anyTarget.on(event, function(response) {
		var context = self.server;
		if (self.hasTarget(response.middle)) {
			context = self.target(response.middle);
		}
		callback.call(context, response);
	});
};

Client.prototype.anyOnce = function(event, callback) {
	var self = this;
	this._anyTarget.once(event, function(response) {
		var context = self.server;
		if (self.hasTarget(response.middle)) {
			context = self.target(response.middle);
		}
		callback.call(context, response);
	});
};

Client.prototype.anyOnAny = function(callback) {
	this.anyOn('_anyResponse', callback);
};

Client.prototype.anyOnceAny = function(callback) {
	this.anyOnce('_anyResponse', callback);
};

Client.prototype._onCommandRequest = function() {
	if (this.commandQueue.length == 0) {
		return;
	}
	var command = this.commandQueue.shift();
	command.sentTimestamp = new Date();

	if (this.opts.sendsPerSec > 0 && this.lastCommandSent != null) {
		var timeDiff = command.sentTimestamp - this.lastCommandSent.sentTimestamp;
		if (timeDiff < 1000) {
			if (this.opts._sendsPerSecCount >= this.opts.sendsPerSec) {
				command.sentTimestamp = null;
				this.commandQueue.unshift(command);
				this.opts._sendsPerSecCount = 0;
				setTimeout(function() {
					this.emit('_request');
				}, 1000 - timeDiff);
				return;
			}
		} else {
			this.opts._sendsPerSecCount = 0;
		}
		this.opts._sendsPerSecCount++;
	}

	this.lastCommandSent = command;
	this.conn.write(command.raw());

	if (this.commandQueue.length > 0) {
		this.emit('_request');
	}
};

Client.prototype._getTarget = function(name) {
	if (name == null) {
		return this.server;
	}

	var target = this.targets[name];
	if (target != null) {
		return target;
	}

	if (targets.Channel.isValidChannelName(name)) {
		target = new targets.Channel(this, name);
	} else {
		target = new targets.User(this, name);
	}
	this.targets[name] = target;
	return target;
};

Client.prototype._log = function(response) {
	if (this.opts.logStream == null) {
		return;
	}

	var from = this.opts.server;
	if (response.prefix != null) {
		from = response.prefix.target;
	}

	if (response.type != null) {
		from += '/' + response.type;
	}

	var readable = response.readable();
	if (readable == '') {
		readable = response.type;
	}
	this.opts.logStream.write(from + '> ' + readable + '\n');
};

Client.prototype._logServerResponse = function(message) {
	this._log({
		type: 'server', 
		readable: function() {
			return message;
		}
	});
};

Client.prototype.register = function() {
	if (this.user.name != null) {
		this.targets[this.user.name] = null;
	}
	this.user.name = this.opts.nick;
	this.targets[this.user.name] = this.user;
	this.send(this.opts.getPassCommand());
	this.send(this.opts.getNickCommand());
	this.send(this.opts.getUserCommand());

	var self = this;
	if (this.opts.autoPong) {
		this.server.on('PING', function() {
			self.send(new cmd.Pong(self.user.name));
		});
	}
	if (this.opts.autoAltNick) {
		this.server.on('433', function() {
			if (self.user.name != null) {
				self.targets[self.user.name] = null;
			}
			var cmd = self.opts.getAltNickCommand();
			if (cmd.middle != null) {
				self.user.name = cmd.middle;
				self.targets[self.user.name] = self.user;
			}
			self.send(cmd);
		});
	}
};


exports.Client = Client;
