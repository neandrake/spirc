var net  = require('net');
var tls = require('tls');
var eventEmitter = require('events').EventEmitter;
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
	var Client = function Client(opts) {
		this._opts = new ClientOpts(opts);
		this._conn = null;
		this._targets = {};
		this._outboundQueue = [];
		this._lastOutbound = null;
		this._lastInbound = null;

		this._allTargets = new Target(this, null);
		this.server = new Host(this, this._opts.server);
		this.user = new User(this, this._opts.nick);

		var self = this;
		self.on('connected', function _cb_onConnected() {
			self._logMessage(self._opts.log.info, 'connected');
			if (self._opts.autoRegister) {
				self.register();
			}
		});

		self.on('error', function _cb_onError(err) {
			self._logMessage(this._opts.log.error, err);
		});

		self.on('disconnected', function _cb_onDisconnected() {
			self._logMessage(this._opts.log.info, 'disconnected');
		});

		self.onceInboundEvent(':NOTICE', function _cb_onceInboundNotice(inbound) {
			var name = self._getTargetNameFromInbound(inbound);
			if (name != null && !self._knowsTargetName(name)) {
				self._targets[name] = self.server;
			}
		});

		self.onInboundEvent(':001', function _cb_on001Registered(inbound) {
			self.emit('registered', inbound);
		});
	};
	inherits(Client, eventEmitter);

	Client.prototype.connect = function connect(callback) {
		var self = this;
		var connectFn = null;
		if (self._opts.secure) {
			connectFn = tls.connect;
		} else {
			connectFn = net.createConnection;
		}

		self._conn = connectFn(self._opts.port, self._opts.server, function _cb_onConnected() {
			self.emit('connected');
		});

		self._conn.on('end', function _cb_onEnd() {
			self.emit('disconnected');
		});

		self._conn.on('close', function _cb_onClose() {
			self.emit('closed');
		});

		self._conn.on('error', function _cb_onError(err) {
			self.emit('error', err);
		});

		self._conn.setEncoding(self._opts.encoding);

		var tr = new TokenReader(self._conn, {
			encoding: self._opts.encoding,
			delimiter: MessageDelim
		});
		
		tr.on('token', function _cb_onToken(token) {
			self._onInbound(token)
		});
	};

	Client.prototype.disconnect = function disconnect(msg) {
		for (var name in this._targets) {
			if (this._targets[name] && this._targets[name].part) {
				this._targets[name].part(msg);
			}
		}
		this.server.quit(msg);
		this._conn.end();
	};

	Client.prototype.register = function register(inbound) {
		var self = this;

		if (self.user.name != null) {
			self._targets[self.user.name] = null;
		}
		self.user.name = self._opts.nick;
		self._targets[self.user.name] = self.user;
		self.send(self._opts.getPassCommand());
		self.send(self._opts.getNickCommand());
		self.send(self._opts.getUserCommand());

		if (self._opts.autoPong) {
			self.server.onPing(function _cb_onPing(inbound) {
				self.send(new Pong(self.user.name));
			});
		}
		if (self._opts.autoAltNick) {
			self.server.on(':433', function _cb_onNickAlreadyRegistered() {
				if (self.user.name != null) {
					self._targets[self.user.name] = null;
				}
				var cmd = self._opts.getAltNickCommand();
				if (cmd.trailing != null) {
					self.user.name = cmd.trailing;
					if (self.user.name.charAt(0) == ':') {
						self.user.name = self.user.name.substring(1);
					}
					self._targets[self.user.name] = self.user;
				}
				self.send(cmd);
			});
		}
	};

	Client.prototype._onInbound = function _onInbound(line) {
		if (line.toUpperCase().indexOf('ERROR') == 0) {
			this.emit('error', line);
			return;
		}

		var inbound = new Inbound(line);
		inbound.recvTimestamp = new Date();
		this._lastInbound = inbound;

		var log = this._opts.log.info;
		if (inbound.command.toUpperCase() == 'ERROR') {
			log = this._opts.log.error;
		}
		this._logInbound(log, inbound);

		var command = inbound.command;
		if (command != null && command.charAt(0) != ':') {
			command = ':' + command;
		}

		this._allTargets.emit('inbound', inbound);
		if (command != null) {
			this._allTargets.emit(command, inbound);
		}

		var target = this._getTargetFromInbound(inbound);
		target.emit('inbound', inbound);
		if (command != null) {
			target.emit(command, inbound);
		}
	};

	Client.prototype.send = function send(command) {
		if (command != null) {
			this._outboundQueue.push(command);
		}
		this._onOutboundQueued();
	};

	Client.prototype._onOutboundQueued = function _onOutboundQueued() {
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
				setTimeout(function _cb_throttleTimeout() {
					self._onOutboundQueued();
				}, minMillisBetweenCommands - millisSinceLastCommand + 1);
				return;
			}
		}

		var command = this._outboundQueue.shift();
		this._conn.write(command.rawline());
		this._logCommand(command);
		command.sentTimestamp = new Date();
		this._lastOutbound = command;
		this.emit('outbound', command);

		if (this._outboundQueue.length > 0) {
			this._onOutboundQueued();
		}
	};

	Client.prototype.getTarget = function getTarget(name) {
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

	Client.prototype._getTargetNameFromInbound = function _getTargetNameFromInbound(inbound) {
		var name = null;
		if (inbound.params != null && inbound.params.length > 0) {
			name = inbound.params[0];
		}
		if (name == null && inbound.prefix != null) {
			name = inbound.prefix.target;
		}
		return name;
	};

	Client.prototype._getTargetFromInbound = function _getTargetFromInbound(inbound) {
		var name = this._getTargetNameFromInbound(inbound);
		if (name == null) {
			return this.server;
		}
		return this.getTarget(name);
	};

	Client.prototype._knowsTargetName = function _knowsTargetName(name) {
		return name != null && this._targets[name.toLowerCase()] != null;
	};

	Client.prototype.onInboundEvent = function onInboundEvent(event, callback) {
		var self = this;
		this._allTargets.on(event, function _cb_allTargetsInbound(inbound) {
			var context = self.server;
			if (self._knowsTargetName(self._getTargetNameFromInbound(inbound))) {
				context = self._getTargetFromInbound(inbound);
			}
			callback.call(context, inbound);
		});
	};

	Client.prototype.onceInboundEvent = function onceInboundEvent(event, callback) {
		var self = this;
		this._allTargets.once(event, function _cb_allTargetsInboundOnce(inbound) {
			var context = self.server;
			if (self._knowsTargetName(self._getTargetNameFromInbound(inbound))) {
				context = self._getTargetFromInbound(inbound);
			}
			callback.call(context, inbound);
		});
	};

	Client.prototype._logCommand = function _logCommand(command) {
		this._opts.log.info('-> ' + this.user.name + '\t' + command.rawline().trim());
	};

	Client.prototype._logInbound = function _logInbound(log, inbound) {
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

	Client.prototype._logMessage = function _logMessage(log, message) {
		log.call(this._opts.log, '<> ' + message);
	};

	return {
		Client: Client
	};
})();
