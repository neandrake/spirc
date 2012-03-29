var net  = require('net');
var util = require('util');
var tokread = require('./tokenreader.js');
var cliopt = require('./clientopts.js');
var msg = require('./message.js');
var rsp = require('./responses.js');
var targets = require('./targets.js');

var Client = function(opts) {
	this.opts = new cliopt.ClientOpts(opts);
	this.server = new targets.Host(null);
	this.user = new targets.User(null);
	this._any = new targets.Target(null);
	this.commandQueue = [];
	this.lastCommandSent = null;
	this.lastResponseRecv = null;
	this.targets = {};
};
util.inherits(Client, process.EventEmitter);

Client.prototype.conn = null;

Client.prototype.connect = function(callback) {
	var self = this;

	self.conn = net.Socket();
	self.conn.setTimeout(0);
	self.conn.setEncoding('utf-8');

	self.conn.on('connect', function() {
		self.emit('onConnected');
	});

	self.conn.on('end', function() {
		self.emit('onDisconnect');
	});

	self.conn.on('close', function(hadError) {
		self.emit('onClose');
	});

	self.conn.on('error', function(errobj) {
		self.emit('onError', errobj);
	});

	var lineReader = new tokread.TokenReader(self.conn, {delimiter: msg.Message.delim});
	lineReader.on('onTokenFound', function(line) {
		self.emit('_onResponseReceived', line);
	});

	self.on('_onResponseReceived', self._onResponseReceived);
	self.on('_onCommandRequest', self._onCommandRequest);

	self.conn.connect(self.opts.port, self.opts.server);
};

Client.prototype.target = function(name) {
	return this._getTarget(name);
}

Client.prototype.disconnect = function() {
	this.conn.end();
};

Client.prototype.send = function(command) {
	var cmd = null;
	for (var i=0, len=arguments.length; i<len; i++) {
		cmd = arguments[i];
		if (cmd != null) {
			this.commandQueue.push(cmd);
			this.emit('_onCommandRequest');
		}
	}
};

Client.prototype._onResponseReceived = function(line) {
	var response = rsp.parse(line);
	if (response == null || response.prefix == null || response.prefix.target == null) {
		this.emit('_onResponseReceived', response);
		return;
	}

	response.recvTimestamp = new Date();
	this.lastResponseRecv = response;

	var name = response.prefix.target;
	var target = this.target(name);
	var type = response.type;
	if (type != null) {
		target.emit(type, response);
	}
	target.emit('_any', response);
	this._any.emit('_any', response);
};

Client.prototype.onAnyResponse = function(callback) {
	this._any.on('_any', callback);
}

Client.prototype._onCommandRequest = function() {
	if (this.commandQueue.length == 0) {
		return;
	}
	var command = this.commandQueue.shift();
	command.sentTimestamp = new Date();
	this.lastCommandSent = command;
	this.conn.write(command.raw());
};

Client.prototype._getTarget = function(name) {
	var target = this.targets[name];
	if (target != null) {
		return target;
	}

	if (this.server.name == null) {
		this.server.name = name;
		target = this.server;
	} else if (targets.Channel.isValidChannelName(name)) {
		target = new targets.Channel(name);
	} else {
		target = new targets.User(name);
	}
	this.targets[name] = target;
	return target;
};

Client.prototype.register = function() {
	if (this.user.name != null) {
		this.targets[this.user.name] = null;
	}
	this.user.name = this.opts.nick;
	this.targets[this.user.name] = this.user;

	var commands = [];
	commands.push(this.opts.getPassCommand());
	commands.push(this.opts.getNickCommand());
	commands.push(this.opts.getUserCommand());
	this.send.apply(this, commands);
};


exports.Client = Client;
