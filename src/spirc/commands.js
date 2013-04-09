var util = require('util');
var msg = require('./message.js');

var Command = function(message) {
	msg.Message.call(this, message);
};
util.inherits(Command, msg.Message);
Command.prototype.setCommand = function(command) {
	if (command == null) {
		throw "Must specify a valid command";
	}
	this.command = command.toUpperCase();
};
Command.prototype.raw = function() {
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
		val += this.trailing;
	}
	val += msg.Message.delim;
	return val;
};

var Away = function(message) {
	Command.call(this);
	this.setTrailing(message);
};
util.inherits(Away, Command);
Away.prototype.command = 'AWAY';

var GetMode = function(chan) {
	Command.call(this);
	this.setMiddle(chan);
};
util.inherits(GetMode, Command);
GetMode.prototype.command = 'MODE';

var Invite = function(nick, chan) {
	Command.call(this);
	this.setMiddle(nick, chan);
};
util.inherits(Invite, Command);
Invite.prototype.command = 'INVITE';

var IsOn = function(nick) {
	Command.call(this);
	this.setMiddle(nick);
};
util.inherits(IsOn, Command);
IsOn.prototype.command = 'ISON';

var Join = function(chan, key) {
	Command.call(this);
	this.setMiddle(chan, key);
};
util.inherits(Join, Command);
Join.prototype.command = 'JOIN';

var Kick = function(chan, nick, message) {
	Command.call(this);
	this.setMiddle(chan, nick);
	this.setTrailing(message);
};
util.inherits(Kick, Command);
Kick.prototype.command = 'KICK';

var List = function(chan) {
	Command.call(this);
	this.setMiddle(chan);
};
util.inherits(List, Command);
List.prototype.command = 'LIST';

var Names = function(chan) {
	Command.call(this);
	this.setMiddle(chan);
};
util.inherits(Names, Command);
Names.prototype.command = 'NAMES';

var Nick = function(nick) {
	Command.call(this);
	this.setMiddle(nick);
};
util.inherits(Nick, Command);
Nick.prototype.command = 'NICK';

var Notice = function(target, message) {
	Command.call(this);
	this.setCommand(Notice.command);
	this.setMiddle(target);
	this.setTrailing(message);
};
util.inherits(Notice, Command);
Notice.prototype.command = 'NOTICE';

var Part = function(chan, message) {
	Command.call(this);
	this.setMiddle(chan);
	this.setTrailing(message);
};
util.inherits(Part, Command);
Part.prototype.command = 'PART';

var Pass = function(pass) {
	Command.call(this);
	this.setMiddle(pass);
};
util.inherits(Pass, Command);
Pass.prototype.command = 'PASS';

var Ping = function(ping) {
	Command.call(this);
	this.setTrailing(ping);
};
util.inherits(Ping, Command);
Ping.prototype.command = 'PING';

var Pong = function(pong) {
	Command.call(this);
	this.setTrailing(pong);
};
util.inherits(Pong, Command);
Pong.prototype.command = 'PONG';

var PrivMsg = function(target, message) {
	Command.call(this);
	this.setMiddle(target);
	this.setTrailing(message);
};
util.inherits(PrivMsg, Command);
PrivMsg.prototype.command = 'PRIVMSG';

var Quit = function(message) {
	Command.call(this);
	this.setTrailing(message);
};
util.inherits(Quit, Command);
Quit.prototype.command = 'QUIT';

var SetMode = function(target, mode) {
	Command.call(this);
	this.setMiddle(target, mode);
};
util.inherits(SetMode, Command);
SetMode.prototype.name = 'MODE';

var Topic = function(chan, topic) {
	Command.call(this);
	this.setMiddle(chan);
	this.setTrailing(topic);
};
util.inherits(Topic, Command);
Topic.prototype.command = 'TOPIC';

var User = function(username, hostname, servername, realname) {
	Command.call(this);
	this.setMiddle(username, hostname, servername);
	this.setTrailing(realname);
};
util.inherits(User, Command);
User.prototype.command = 'USER';

var Who = function(criteric) {
	Command.call(this);
	this.setMiddle(criteric);
};
util.inherits(Who, Command);
Who.prototype.command = 'WHO';

var Whois = function(nick) {
	Command.call(this);
	this.setMiddle(nick);
};
util.inherits(Whois, Command);
Whois.prototype.command = 'WHOIS';

var Whowas = function(nick) {
	Command.call(this);
	this.setMiddle(nick);
};
util.inherits(Whowas, Command);
Whowas.prototype.command = 'WHOWAS';

var UserHost = function(nicks) {
	Command.call(this);
	this.setMiddle(nicks);
};
util.inherits(UserHost, Command);
UserHost.prototype.command = 'USERHOST';





exports.Away = Away;
exports.Invite = Invite;
exports.IsOn = IsOn;
exports.Join = Join;
exports.Kick = Kick;
exports.List = List;
exports.Names = Names;
exports.Nick = Nick;
exports.Notice = Notice;
exports.Part = Part;
exports.Pass = Pass;
exports.Ping = Ping;
exports.Pong = Pong;
exports.PrivMsg = PrivMsg;
exports.Quit = Quit;
exports.Topic = Topic;
exports.User = User;
exports.Who = Who;
exports.Whois = Whois;
exports.Whowas = Whowas;
exports.UserHost = UserHost;
exports.GetMode = GetMode;
exports.SetMode = SetMode;
