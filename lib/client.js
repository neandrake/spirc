var net  = require('net');
var util = require('util');
var tokread = require('./tokenreader.js');
var cliopt = require('./clientopts.js');
var msg = require('./message.js');
var cmd = require('./commands.js');

var Client = function(opts) {
	this.opts = new cliopt.ClientOpts(opts);
	this.messageSendQueue = [];
	this.lastMessageSent = null;
};
util.inherits(Client, process.EventEmitter);

Client.prototype.conn = null;

Client.prototype.connect = function(callback) {
	var self = this;

	self.conn = net.Socket();
	self.conn.setTimeout(0);
	self.conn.setEncoding('utf-8');

	self.conn.addListener('connect', function() {
		self.emit('onConnected');
	});

	self.conn.addListener('end', function() {
		self.emit('onDisconnect');
	});

	self.conn.addListener('close', function(hadError) {
		self.emit('onClose');
	});

	self.conn.addListener('error', function(errobj) {
		self.emit('onError', errobj);
	});

	var lineReader = new tokread.TokenReader(self.conn, {delimiter: msg.Message.delim});
	lineReader.addListener('onTokenFound', function(line) {
		self.emit('onMessageReceived', cmd.parse(line));
	});

	self.addListener('_onMessageSendRequested', self._onMessageSendRequested);

	self.conn.connect(self.opts.port, self.opts.server);
};

Client.prototype.disconnect = function() {
	this.conn.end();
};

Client.prototype.send = function(message) {
	this.messageSendQueue.push(message);
	this.emit('_onMessageSendRequested');
};

Client.prototype._onMessageSendRequested = function() {
	if (this.messageSendQueue.length == 0) {
		return;
	}
	var message = this.messageSendQueue.shift();
	message.sentTimestamp = new Date();
	this.lastMessageSent = message;
	this.conn.write(message.raw());
	this.emit('_onMessageSendRequested');
};


exports.Client = Client;
