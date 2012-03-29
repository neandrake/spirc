var net  = require('net');
var util = require('util');
var tokread = require('./tokenreader.js');
var cliopt = require('./clientopts.js');
var msg = require('./message.js');
var rsp = require('./responses.js');
var chan = require('./channel.js');
var user = require('./user.js');
var host = require('./host.js');

var Client = function(opts) {
	this.opts = new cliopt.ClientOpts(opts);
	this.server = new host.Host(null);
	this._any = new host.Host(null);
	this.messageSendQueue = [];
	this.lastMessageSent = null;
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
		self.emit('_onMessageReceived', line);
	});

	self.on('_onMessageReceived', self._onMessageReceived);
	self.on('_onMessageSendRequested', self._onMessageSendRequested);

	self.conn.connect(self.opts.port, self.opts.server);
};

Client.prototype.target = function(name) {
	return this._getTarget(name);
}

Client.prototype.disconnect = function() {
	this.conn.end();
};

Client.prototype.send = function(message) {
	this.messageSendQueue.push(message);
	this.emit('_onMessageSendRequested');
};

Client.prototype._onMessageReceived = function(line) {
	var response = rsp.parse(line);
	if (response == null || response.prefix == null || response.prefix.target == null) {
		this.emit('_onMessageReceived', response);
		return;
	}

	var name = response.prefix.target;
	var target = this.target(name);
	var event = response.cmdcode;
	if (event == null) {
		event = 'any';
	}
	target.emit(event, response);
	this._any.emit('any', response);
};

Client.prototype.any = function(callback) {
	this._any.on('any', callback);
}

Client.prototype._onMessageSendRequested = function() {
	if (this.messageSendQueue.length == 0) {
		return;
	}
	var message = this.messageSendQueue.shift();
	message.sentTimestamp = new Date();
	this.lastMessageSent = message;
	this.conn.write(message.raw());
};

Client.prototype._getTarget = function(name) {
	var target = this.targets[name];
	if (target != null) {
		return target;
	}

	if (this.server.host == null) {
		this.server.host = name;
		target = this.server;
	} else if (chan.Channel.isValidChannelName(name)) {
		target = new chan.Channel(name);
	} else {
		target = new user.User(name);
	}
	this.targets[name] = target;
	return target;
}


exports.Client = Client;
