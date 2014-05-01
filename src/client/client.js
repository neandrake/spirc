var net  = require('net');
var tls = require('tls');
var inherits = require('util').inherits;

var TokenReader = require('../util/tokread.js').TokenReader;
var ClientOpts = require('./clientopts.js').ClientOpts;

var msg = require('../core/message.js'),
	MessageDelim = msg.Message.delim,
	Inbound = msg.Inbound;

var targets = require('../core/targets.js'),
	Channel = targets.Channel,
	Host = targets.Host,
	Target = targets.Target,
	User = targets.User;

var req = require('../core/requests.js'),
	Pong = req.Pong;

module.exports = (function client_export() {
	var Client = function(opts) {
		this._opts = new ClientOpts(opts);
		this._conn = null;
		this._commandQueue = [];
		this._lastCommandSent = null;
		this._lastResponseRecv = null;
		this._targets = {};

		this._anyTarget = new Target(this, null);
		this.server = new Host(this, this._opts.server);
		this.user = new User(this, this._opts.nick);

		var self = this;
		self.on('connect', function() {
			self._logMessage(self._opts.log.info, 'connected');
			if (self._opts.autoRegister) {
				self.register();
			}
		});

		self.on('error', function(err) {
			self._logMessage(this._opts.log.error, err);
		});

		self.on('disconnect', function() {
			self._logMessage(this._opts.log.info, 'disconnected');
		});

		self.anyOnce('001', function() {
			self.emit('register');
		});

		self.anyOnAny(function(response) {
			var log = self._opts.log.info;
			if (response.command == 'ERROR') {
				log = self._opts.log.error;
			}
			self._logResponse(log, response);
		});

		self.on('_receive', self._onResponseReceived);
		self.on('_request', self._onCommandRequest);
	};
	inherits(Client, process.EventEmitter);

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

		self._conn.on('close', function() {
			self.emit('close');
		});

		self._conn.on('error', function(err) {
			self.emit('error', err);
		});

		var tr = new TokenReader(self._conn, { delimiter: MessageDelim });
		tr.on('token', function(token) {
			self.emit('_receive', token);
		});
	};

	Client.prototype.disconnect = function(msg) {
		this.server.quit(msg);
	};

	Client.prototype.getTarget = function(name, strict) {
		if (name == null) {
			return null;
		}

		var target = this._targets[name];
		if (target != null) {
			return target;
		}

		if (strict) {
			return null;
		}

		if (Channel.isValidChannelName(name)) {
			target = new Channel(this, name);
		} else {
			target = new User(this, name);
		}
		this._targets[name] = target;
		return target;
	};

	Client.prototype._getTargetOrServer = function(response) {
		if (response.params == null) {
			return this.server;
		}

		var name = response.params[0] != null ? response.params[0].toLowerCase() : null;
		var target = this.getTarget(name, true);
		if (target == null) {
			target = this.server;
			this._targets[name] = target;
		}
		return target;
	};

	Client.prototype.hasTarget = function(name) {
		return this.getTarget(name, true) != null;
	};

	Client.prototype.getServerAliases = function() {
		var aliases = [];
		for (var name in this._targets) {
			if (this._targets[name] == this.server) {
				aliases.push(name);
			}
		}
		return aliases;
	}

	Client.prototype._onResponseReceived = function(line) {
		var response = new Inbound(line);
		response.recvTimestamp = new Date();
		this._lastResponseRecv = response;

		var target = this._getTargetOrServer(response);
		var command = response.command;
		if (command != null) {
			target.emit(command, response);
			this._anyTarget.emit(command, response);
		}
		target.emit('_anyResponse', response);
		this._anyTarget.emit('_anyResponse', response);
	};

	Client.prototype._onCommandRequest = function() {
		if (this._commandQueue.length == 0) {
			return;
		}
		
		var sendsPerSec = this._opts.sendsPerSec;
		
		// Make sure we don't have some crazy value for sendsPerSec
		if (sendsPerSec < 0) {
			sendsPerSec = 0; // this disables rate-limiting (DON'T DO THIS, FOOL)
		} else if (sendsPerSec > 100) {
			sendsPerSec = 100;
		}
		
		if (sendsPerSec > 0 && this._lastCommandSent != null) {
			var now = new Date();
			var lastCommand = this._lastCommandSent;
			
			// The minimum amount of time that the client will wait between sending commands
			// to prevent it from being floodkicked.  For example, if you set sendsPerSecond
			// to 4, the client will wait at least 250 milliseconds between each sent command
			// to prevent it from sending more than 4 commands per second.
			var minMillisBetweenCommands = (1000 + sendsPerSec - 1) / sendsPerSec;
			var millisSinceLastCommand = now - lastCommand.sentTimestamp;
			
			if (millisSinceLastCommand < minMillisBetweenCommands) {
				var self = this;
				setTimeout(function() {
					self.emit('_request');
				}, minMillisBetweenCommands - millisSinceLastCommand + 1);
				return;
			}
		}

		var command = this._commandQueue.shift();
		this._logCommand(command);
		this._conn.write(command.rawline());
		command.sentTimestamp = new Date();
		this._lastCommandSent = command;

		if (this._commandQueue.length > 0) {
			this.emit('_request');
		}
	};

	Client.prototype.anyOn = function(event, callback) {
		var self = this;
		this._anyTarget.on(event, function(response) {
			var context = self._getTargetOrServer(response);
			callback.call(context, response);
		});
	};

	Client.prototype.anyOnce = function(event, callback) {
		var self = this;
		this._anyTarget.once(event, function(response) {
			var context = self._getTargetOrServer(response);
			callback.call(context, response);
		});
	};

	Client.prototype.anyOnAny = function(callback) {
		this.anyOn('_anyResponse', callback);
	};

	Client.prototype.anyOnceAny = function(callback) {
		this.anyOnce('_anyResponse', callback);
	};

	Client.prototype.send = function(command) {
		if (command != null) {
			this._commandQueue.push(command);
		}
		this.emit('_request');
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
				self.send(new Pong(self.user.name));
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

	Client.prototype._logCommand = function(command) {
		this._opts.log.info('-> ' + this.user.name + '\t' + command.rawline().trim());
	};

	Client.prototype._logResponse = function(log, response) {
		var from = this._opts.server;
		if (response.prefix != null) {
			from = response.prefix.target;
		}

		if (response.command != null) {
			from += '/' + response.command;
		}

		var readable = '';
		if (response.middle != null) {
			readable += response.middle.join(' ');
		}
		if (response.trailing != null) {
			readable += ' ' + response.trailing;
		}

		if (readable == '') {
			readable = response.command;
		}
		log.call(this._opts.log, '<- ' + from + '\t' + readable);
	};

	Client.prototype._logMessage = function(log, message) {
		log.call(this._opts.log, '<- ' + message);
	};

	return {
		Client: Client
	};
})();
