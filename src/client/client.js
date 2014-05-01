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
		this._targets = {};
		this._outboundQueue = [];
		this._lastOutbound = null;
		this._lastInbound = null;

		this._anyTarget = new Target(this, null);
		this.server = new Host(this, this._opts.server);
		this.user = new User(this, this._opts.nick);

		var self = this;
		self.on('connected', function() {
			self._logMessage(self._opts.log.info, 'connected');
			if (self._opts.autoRegister) {
				self.register();
			}
		});

		self.on('error', function(err) {
			self._logMessage(this._opts.log.error, err);
		});

		self.on('disconnected', function() {
			self._logMessage(this._opts.log.info, 'disconnected');
		});

		self.anyOnce(':NOTICE', function(inbound) {
			self._getTargetFromInbound(inbound);
 		});

		self.anyOnce(':001', function(inbound) {
			self.emit('registered', inbound);
		});

		self.anyOnAny(function(inbound) {
			var log = self._opts.log.info;
			if (inbound.command.toUpperCase() == 'ERROR') {
				log = self._opts.log.error;
			}
			self._logInbound(log, inbound);
		});
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
			self.emit('connected');
		});

		self._conn.on('end', function() {
			self.emit('disconnected');
		});

		self._conn.on('close', function() {
			self.emit('closed');
		});

		self._conn.on('error', function(err) {
			self.emit('error', err);
		});

		var tr = new TokenReader(self._conn, { delimiter: MessageDelim });
		tr.on('token', function(token) {
			self._onInbound(token)
		});
	};

	Client.prototype.disconnect = function(msg) {
		for (var name in this._targets) {
			if (this._targets[name].part) {
				this._targets[name].part(msg);
			}
		}
		this.server.quit(msg);
	};

	Client.prototype.register = function(inbound) {
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
			this.server.on(':PING', function() {
				self.send(new Pong(self.user.name));
			});
		}
		if (this._opts.autoAltNick) {
			this.server.on(':433', function() {
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

	Client.prototype._onInbound = function(line) {
		if (line.toUpperCase().indexOf('ERROR') == 0) {
			this.emit('error', line);
			return;
		}

		var inbound = new Inbound(line);
		inbound.recvTimestamp = new Date();
		this._lastInbound = inbound;

		var target = this._getTargetFromInbound(inbound);
		var command = inbound.command;
		if (command != null) {
			command = ':' + command;
			target.emit(command, inbound);
			this._anyTarget.emit(command, inbound);
		}
		target.emit('_anyResponse', inbound);
		this._anyTarget.emit('_anyResponse', inbound);
	};

	Client.prototype.send = function(command) {
		if (command != null) {
			this._outboundQueue.push(command);
		}
		this._onOutboundQueued();
	};

	Client.prototype._onOutboundQueued = function() {
		if (this._outboundQueue.length == 0) {
			return;
		}
		
		var sendsPerSec = this._opts.sendsPerSec;
		
		// Make sure we don't have some crazy value for sendsPerSec
		if (sendsPerSec < 0) {
			sendsPerSec = 0; // this disables rate-limiting (DON'T DO THIS, FOOL)
		} else if (sendsPerSec > 100) {
			sendsPerSec = 100;
		}
		
		if (sendsPerSec > 0 && this._lastOutbound != null) {
			var now = new Date();
			var lastCommand = this._lastOutbound;
			
			// The minimum amount of time that the client will wait between sending commands
			// to prevent it from being floodkicked.  For example, if you set sendsPerSecond
			// to 4, the client will wait at least 250 milliseconds between each sent command
			// to prevent it from sending more than 4 commands per second.
			var minMillisBetweenCommands = (1000 + sendsPerSec - 1) / sendsPerSec;
			var millisSinceLastCommand = now - lastCommand.sentTimestamp;
			
			if (millisSinceLastCommand < minMillisBetweenCommands) {
				var self = this;
				setTimeout(function() {
					self._onOutboundQueued();
				}, minMillisBetweenCommands - millisSinceLastCommand + 1);
				return;
			}
		}

		var command = this._outboundQueue.shift();
		this._logCommand(command);
		this._conn.write(command.rawline());
		command.sentTimestamp = new Date();
		this._lastOutbound = command;
		this.emit('_outbound', command);

		if (this._outboundQueue.length > 0) {
			this._onOutboundQueued();
		}
	};

	Client.prototype.getTarget = function(name) {
		name = name.toLowerCase();
		var target = this._targets[name];
		if (target != null) {
			return target;
		}

		if (Channel.isValidChannelName(name)) {
			target = new Channel(this, name);
		} else {
			target = new User(this, name);
		}
		this._targets[name] = target;
		return target;
	};

	Client.prototype._getTargetFromInbound = function(inbound) {
		var name = null;
		if (inbound.params != null && inbound.params.length > 0) {
			name = inbound.params[0];
		}
		if (name == null && inbound.prefix != null) {
			name = inbound.prefix.target;
		}
		if (name == null) {
			return this.server;
		}

		return this.getTarget(name);
	};

	Client.prototype.knowsTarget = function(name) {
		return this._targets[name.toLowerCase()] != null;
	};

	Client.prototype.anyOnce = function(event, callback) {
		var self = this;
		this._anyTarget.once(event, function(inbound) {
			var context = self._getTargetFromInbound(inbound);
			callback.call(context, inbound);
		});
	};

	Client.prototype.anyOnAny = function(callback) {
		var self = this;
		this._anyTarget.on('_anyResponse', function(inbound) {
			var context = self._getTargetFromInbound(inbound);
			callback.call(context, inbound);
		});
	};

	Client.prototype._logCommand = function(command) {
		this._opts.log.info('-> ' + this.user.name + '\t' + command.rawline().trim());
	};

	Client.prototype._logInbound = function(log, inbound) {
		var from = this._opts.server;
		if (inbound.prefix != null) {
			from = inbound.prefix.target;
		}

		if (inbound.command != null) {
			from += '/' + inbound.command;
		}

		var readable = '';
		if (inbound.middle != null) {
			readable += inbound.middle.join(' ');
		}
		if (inbound.trailing != null) {
			readable += ' ' + inbound.trailing;
		}

		if (readable == '') {
			readable = inbound.command;
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
