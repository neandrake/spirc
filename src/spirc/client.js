var net  = require('net');
var tls = require('tls');
var util = require('util');
var tokread = require('./tokenreader.js');
var cliopt = require('./clientopts.js');
var msg = require('./message.js');
var rsp = require('./responses.js');
var targets = require('./targets.js');
var cmd = require('./commands.js');

var Client = function(opts) {
	this._opts = new cliopt.ClientOpts(opts);
	this._conn = null;
	this._commandQueue = [];
	this._lastCommandSent = null;
	this._lastResponseRecv = null;
	this._targets = {};

	this._anyTarget = new targets.Target(this, null);
	this.server = new targets.Host(this, this._opts.server);
	this.user = new targets.User(this, this._opts.nick);

	var self = this;
	self.on('connect', function() {
		self._logServerResponse('connected');
		if (self._opts.autoRegister) {
			self.register();
		}
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

Client.prototype.connect = function(callback) {
	var self = this;
	var connectFn = null;
	if (self._opts.secure) {
		connectFn = tls.connect;
	} else {
		connectFn = net.createConnection;
	}

	self._conn = connectFn(self._opts.port, self._opts.server, function() {
		self.emit('connect');
	});

	self._conn.on('end', function() {
		self.emit('disconnect');
	});

	self._conn.on('close', function(hadError) {
		self.emit('close');
	});

	self._conn.on('error', function(errobj) {
		self.emit('error', errobj);
	});

	var tr = new tokread.TokenReader(self._conn, {
		delimiter: msg.Message.delim
	});

	tr.on('token', function(token) {
		self.emit('_receive', token);
	});
};

Client.prototype.target = function(name) {
	return this._getTarget(name);
};

Client.prototype.hasTarget = function(name) {
	return this._targets[name] != null;
};

Client.prototype.disconnect = function() {
	this.server.quit();
	this._conn.end();
};

Client.prototype.send = function(command) {
	if (command != null) {
		this._commandQueue.push(command);
	}
	this.emit('_request');
};

Client.prototype._onResponseReceived = function(line) {
	var response = new rsp.Response(line);
	response.recvTimestamp = new Date();
	this._lastResponseRecv = response;

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
	if (this._commandQueue.length == 0) {
		return;
	}
	var command = this._commandQueue.shift();
	command.sentTimestamp = new Date();

	if (this._opts.sendsPerSec > 0 && this._lastCommandSent != null) {
		var timeDiff = command.sentTimestamp - this._lastCommandSent.sentTimestamp;
		if (timeDiff < 1000) {
			if (this._opts._sendsPerSecCount >= this._opts.sendsPerSec) {
				command.sentTimestamp = null;
				this._commandQueue.unshift(command);
				this._opts._sendsPerSecCount = 0;
				setTimeout(function() {
					this.emit('_request');
				}, 1000 - timeDiff);
				return;
			}
		} else {
			this._opts._sendsPerSecCount = 0;
		}
		this._opts._sendsPerSecCount++;
	}

	this._lastCommandSent = command;
	this._conn.write(command.raw());

	if (this._commandQueue.length > 0) {
		this.emit('_request');
	}
};

Client.prototype._getTarget = function(name) {
	if (name == null) {
		return this.server;
	}

	var target = this._targets[name];
	if (target != null) {
		return target;
	}

	if (targets.Channel.isValidChannelName(name)) {
		target = new targets.Channel(this, name);
	} else {
		target = new targets.User(this, name);
	}
	this._targets[name] = target;
	return target;
};

Client.prototype._log = function(response) {
	if (this._opts.logStream == null) {
		return;
	}

	var from = this._opts.server;
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
	this._opts.logStream.write(from + '> ' + readable + '\n');
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
		this._targets[this.user.name] = null;
	}
	this.user.name = this._opts.nick;
	this._targets[this.user.name] = this.user;
	this.send(this._opts.getPassCommand());
	this.send(this._opts.getNickCommand());
	this.send(this._opts.getUserCommand());

	var self = this;
	if (this._opts.autoPong) {
		this.server.on('PING', function() {
			self.send(new cmd.Pong(self.user.name));
		});
	}
	if (this._opts.autoAltNick) {
		this.server.on('433', function() {
			if (self.user.name != null) {
				self._targets[self.user.name] = null;
			}
			var cmd = self._opts.getAltNickCommand();
			if (cmd.middle != null) {
				self.user.name = cmd.middle;
				self._targets[self.user.name] = self.user;
			}
			self.send(cmd);
		});
	}
};


exports.Client = Client;
