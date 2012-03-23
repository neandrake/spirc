var util = require('util');
var msg = require('./message.js');

var Away = function(msg) {
	msg.Message.call(this);
	this.setTrailing(msg);
};
util.inherits(Away, msg.Message);
Away.prototype.command = 'AWAY';

var GetMode = function(chan) {
	msg.Message.call(this);
	this.setMiddle(chan);
};
util.inherits(GetMode, msg.Message);
GetMode.prototype.command = 'MODE';

var Invite = function(nick, chan) {
	msg.Message.call(this);
	this.setMiddle(nick, chan);
};
util.inherits(Invite, msg.Message);
Invite.prototype.command = 'INVITE';

var IsOn = function(nick) {
	msg.Message.call(this);
	this.setMiddle(nick);
};
util.inherits(IsOn, msg.Message);
IsOn.prototype.command = 'ISON';

var Join = function(chan, key) {
	msg.Message.call(this);
	this.setMiddle(chan, key);
};
util.inherits(Join, msg.Message);
Join.prototype.command = 'JOIN';

var Kick = function(chan, nick, msg) {
	msg.Message.call(this);
	this.setMiddle(chan, nick);
	this.setTrailing(msg);
};
util.inherits(Kick, msg.Message);
Kick.prototype.command = 'KICK';

var List = function(chan) {
	msg.Message.call(this);
	this.setMiddle(chan);
};
util.inherits(List, msg.Message);
List.prototype.command = 'LIST';

var Names = function(chan) {
	msg.Message.call(this);
	this.setMiddle(chan);
};
util.inherits(Names, msg.Message);
Names.prototype.command = 'NAMES';

var Nick = function(nick) {
	msg.Message.call(this);
	this.setMiddle(nick);
};
util.inherits(Nick, msg.Message);
Nick.prototype.command = 'NICK';

var Notice = function(target, msg) {
	msg.Message.call(this);
	this.setCommand(Notice.command);
	this.setMiddle(target);
	this.setTrailing(msg);
};
util.inherits(Notice, msg.Message);
Notice.prototype.command = 'NOTICE';

var Pass = function(pass) {
	msg.Message.call(this);
	this.setMiddle(pass);
};
util.inherits(Pass, msg.Message);
Pass.prototype.command = 'PASS';

var PrivMsg = function(target, msg) {
	msg.Message.call(this);
	this.setMiddle(target);
	this.setTrailing(msg);
};
util.inherits(PrivMsg, msg.Message);
PrivMsg.prototype.command = 'PRIVMSG';

var Part = function(chan, msg) {
	msg.Message.call(this);
	this.setMiddle(chan);
	this.setTrailing(msg);
};
util.inherits(Part, msg.Message);
Part.prototype.command = 'PART';

var Pong = function(ping) {
	msg.Message.call(this);
	this.setTrailing(ping);
};
util.inherits(Pong, msg.Message);
Pong.prototype.command = 'PONG';

var Quit = function(msg) {
	msg.Message.call(this);
	this.setTrailing(msg);
};
util.inherits(Quit, msg.Message);
Quit.prototype.command = 'QUIT';

var SetMode = function(target, mode) {
	msg.Message.call(this);
	this.setMiddle(target, mode);
};
util.inherits(SetMode, msg.Message);
SetMode.prototype.name = 'MODE';

var Topic = function(chan, topic) {
	msg.Message.call(this);
	this.setMiddle(chan);
	this.setTrailing(topic);
};
util.inherits(Topic, msg.Message);
Topic.prototype.command = 'TOPIC';

var User = function(user, ip, host, real) {
	msg.Message.call(this);
	this.setMiddle(user, ip, host);
	this.setTrailing(real);
};
util.inherits(User, msg.Message);
User.prototype.command = 'USER';

var Who = function(criteric) {
	msg.Message.call(this);
	this.setMiddle(criteric);
};
util.inherits(Who, msg.Message);
Who.prototype.command = 'WHO';

var Whois = function(nick) {
	msg.Message.call(this);
	this.setMiddle(nick);
};
util.inherits(Whois, msg.Message);
Whois.prototype.command = 'WHOIS';

var Whowas = function(nick) {
	msg.Message.call(this);
	this.setMiddle(nick);
};
util.inherits(Whowas, msg.Message);
Whowas.prototype.command = 'WHOWAS';

var UserHost = function(nicks) {
	msg.Message.call(this);
	this.setMiddle(nicks);
};
util.inherits(UserHost, msg.Message);
UserHost.prototype.command = 'USERHOST';


exports.Pass = Pass;
exports.Nick = Nick;
exports.User = User;
exports.Away = Away;
exports.Invite = Invite;
exports.IsOn = IsOn;
exports.Join = Join;
exports.Kick = Kick;
exports.List = List;
exports.Names = Names;
exports.PrivMsg = PrivMsg;
exports.Notice = Notice;
exports.Part = Part;
exports.Pong = Pong;
exports.Quit = Quit;
exports.Topic = Topic;
exports.Who = Who;
exports.Whois = Whois;
exports.Whowas = Whowas;
exports.UserHost = UserHost;
exports.GetMode = GetMode;
exports.SetMode = SetMode;
