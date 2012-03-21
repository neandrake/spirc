var util = require('util');
var msg = require('./message.js');

var Away = function(msg) {
	this.setTrailing(msg);
};
util.inherits(Away, msg.Message);
Away.prototype.command = 'AWAY';

var GetMode = function(chan) {
	this.setMiddle(chan);
};
util.inherits(GetMode, msg.Message);
GetMode.prototype.command = 'MODE';

var Invite = function(nick, chan) {
	this.setMiddle(nick, chan);
};
util.inherits(Invite, msg.Message);
Invite.prototype.command = 'INVITE';

var IsOn = function(nick) {
	this.setMiddle(nick);
};
util.inherits(IsOn, msg.Message);
IsOn.prototype.command = 'ISON';

var Join = function(chan, key) {
	this.setMiddle(chan, key);
};
util.inherits(Join, msg.Message);
Join.prototype.command = 'JOIN';

var Kick = function(chan, nick, msg) {
	this.setMiddle(chan, nick);
	this.setTrailing(msg);
};
util.inherits(Kick, msg.Message);
Kick.prototype.command = 'KICK';

var List = function(chan) {
	this.setMiddle(chan);
};
util.inherits(List, msg.Message);
List.prototype.command = 'LIST';

var Names = function(chan) {
	this.setMiddle(chan);
};
util.inherits(Names, msg.Message);
Names.prototype.command = 'NAMES';

var Nick = function(nick) {
	this.setMiddle(nick);
};
util.inherits(Nick, msg.Message);
Nick.prototype.command = 'NICK';

var Notice = function(target, msg) {
	this.setCommand(Notice.command);
	this.setMiddle(target);
	this.setTrailing(msg);
};
util.inherits(Notice, msg.Message);
Notice.command = 'NOTICE';
Notice.prototype.print = function() {
	return this.trailing;
};

var Pass = function(pass) {
	this.setMiddle(pass);
};
util.inherits(Pass, msg.Message);
Pass.prototype.command = 'PASS';

var PrivMsg = function(target, msg) {
	this.setMiddle(target);
	this.setTrailing(msg);
};
util.inherits(PrivMsg, msg.Message);
PrivMsg.prototype.command = 'PRIVMSG';

var Part = function(chan, msg) {
	this.setMiddle(chan);
	this.setTrailing(msg);
};
util.inherits(Part, msg.Message);
Part.prototype.command = 'PART';

var Pong = function(ping) {
	this.setTrailing(ping);
};
util.inherits(Pong, msg.Message);
Pong.prototype.command = 'PONG';

var Quit = function(msg) {
	this.setTrailing(msg);
};
util.inherits(Quit, msg.Message);
Quit.prototype.command = 'QUIT';

var SetMode = function(target, mode) {
	this.setMiddle(target, mode);
};
util.inherits(SetMode, msg.Message);
SetMode.prototype.name = 'MODE';

var Topic = function(chan, topic) {
	this.setMiddle(chan);
	this.setTrailing(topic);
};
util.inherits(Topic, msg.Message);
Topic.prototype.command = 'TOPIC';

var User = function(user, ip, host, real) {
	this.setMiddle(user, ip, host);
	this.setTrailing(real);
};
util.inherits(User, msg.Message);
User.prototype.command = 'USER';

var Who = function(criteric) {
	this.setMiddle(criteric);
};
util.inherits(Who, msg.Message);
Who.prototype.command = 'WHO';

var Whois = function(nick) {
	this.setMiddle(nick);
};
util.inherits(Whois, msg.Message);
Whois.prototype.command = 'WHOIS';

var Whowas = function(nick) {
	this.setMiddle(nick);
};
util.inherits(Whowas, msg.Message);
Whowas.prototype.command = 'WHOWAS';

var UserHost = function(nicks) {
	this.setMiddle(nicks);
};
util.inherits(UserHost, msg.Message);
UserHost.prototype.command = 'USERHOST';



var parse = function(msgline) {
	var asMsg = new msg.Message(msgline);
	var asTyped = asMsg;
	switch (asMsg.command) {
		case Away.command: asTyped = new Away(); break;
		case GetMode.command: asTyped = new GetMode(); break;
		case Invite.command: asTyped = new Invite(); break;
		case IsOn.command: asTyped = new IsOn(); break;
		case Join.command: asTyped = new Join(); break;
		case Kick.command: asTyped = new Kick(); break;
		case List.command: asTyped = new List(); break;
		case Names.command: asTyped = new Names(); break;
		case Nick.command: asTyped = new Nick(); break;
		case Notice.command: asTyped = new Notice(); break;
		case Pass.command: asTyped = new Pass(); break;
		case PrivMsg.command: asTyped = new PrivMsg(); break;
		case Part.command: asTyped = new Part(); break;
		case Pong.command: asTyped = new Pong(); break;
		case Quit.command: asTyped = new Quit(); break;
		case SetMode.command: asTyped = new SetMode(); break;
		case Topic.command: asTyped = new Topic(); break;
		case User.command: asTyped = new User(); break;
		case Who.command: asTyped = new Who(); break;
		case Whois.command: asTyped = new Whois(); break;
		case Whowas.command: asTyped = new Whowas(); break;
		case UserHost.command: asTyped = new UserHost(); break;
	};
	asTyped.copy(asMsg);
	return asTyped;
};

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
exports.parse = parse;
