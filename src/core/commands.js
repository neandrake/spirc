var inherits = require('util').inherits;

var Command = require('./message.js').Command;

module.exports = (function commands_export() {
	var Away = function(message) {
		Command.call(this);
		this.setTrailing(message);
	};
	inherits(Away, Command);
	Away.prototype.command = 'AWAY';

	var GetMode = function(chan) {
		Command.call(this);
		this.setMiddle(chan);
	};
	inherits(GetMode, Command);
	GetMode.prototype.command = 'MODE';

	var Invite = function(nick, chan) {
		Command.call(this);
		this.setMiddle(nick, chan);
	};
	inherits(Invite, Command);
	Invite.prototype.command = 'INVITE';

	var IsOn = function(nick) {
		Command.call(this);
		this.setMiddle(nick);
	};
	inherits(IsOn, Command);
	IsOn.prototype.command = 'ISON';

	var Join = function(chan, key) {
		Command.call(this);
		this.setMiddle(chan, key);
	};
	inherits(Join, Command);
	Join.prototype.command = 'JOIN';

	var Kick = function(chan, nick, message) {
		Command.call(this);
		this.setMiddle(chan, nick);
		this.setTrailing(message);
	};
	inherits(Kick, Command);
	Kick.prototype.command = 'KICK';

	var List = function(chan) {
		Command.call(this);
		this.setMiddle(chan);
	};
	inherits(List, Command);
	List.prototype.command = 'LIST';

	var Names = function(chan) {
		Command.call(this);
		this.setMiddle(chan);
	};
	inherits(Names, Command);
	Names.prototype.command = 'NAMES';

	var Nick = function(nick) {
		Command.call(this);
		this.setMiddle(nick);
	};
	inherits(Nick, Command);
	Nick.prototype.command = 'NICK';

	var Notice = function(target, message) {
		Command.call(this);
		this.setCommand(Notice.command);
		this.setMiddle(target);
		this.setTrailing(message);
	};
	inherits(Notice, Command);
	Notice.prototype.command = 'NOTICE';

	var Part = function(chan, message) {
		Command.call(this);
		this.setMiddle(chan);
		this.setTrailing(message);
	};
	inherits(Part, Command);
	Part.prototype.command = 'PART';

	var Pass = function(pass) {
		Command.call(this);
		this.setMiddle(pass);
	};
	inherits(Pass, Command);
	Pass.prototype.command = 'PASS';

	var Ping = function(ping) {
		Command.call(this);
		this.setTrailing(ping);
	};
	inherits(Ping, Command);
	Ping.prototype.command = 'PING';

	var Pong = function(pong) {
		Command.call(this);
		this.setTrailing(pong);
	};
	inherits(Pong, Command);
	Pong.prototype.command = 'PONG';

	var PrivMsg = function(target, message) {
		Command.call(this);
		this.setMiddle(target);
		this.setTrailing(message);
	};
	inherits(PrivMsg, Command);
	PrivMsg.prototype.command = 'PRIVMSG';

	var Quit = function(message) {
		Command.call(this);
		this.setTrailing(message);
	};
	inherits(Quit, Command);
	Quit.prototype.command = 'QUIT';

	var SetMode = function(target, mode) {
		Command.call(this);
		this.setMiddle(target, mode);
	};
	inherits(SetMode, Command);
	SetMode.prototype.name = 'MODE';

	var Topic = function(chan, topic) {
		Command.call(this);
		this.setMiddle(chan);
		this.setTrailing(topic);
	};
	inherits(Topic, Command);
	Topic.prototype.command = 'TOPIC';

	var User = function(username, hostname, servername, realname) {
		Command.call(this);
		this.setMiddle(username, hostname, servername);
		this.setTrailing(realname);
	};
	inherits(User, Command);
	User.prototype.command = 'USER';

	var Who = function(criteric) {
		Command.call(this);
		this.setMiddle(criteric);
	};
	inherits(Who, Command);
	Who.prototype.command = 'WHO';

	var Whois = function(nick) {
		Command.call(this);
		this.setMiddle(nick);
	};
	inherits(Whois, Command);
	Whois.prototype.command = 'WHOIS';

	var Whowas = function(nick) {
		Command.call(this);
		this.setMiddle(nick);
	};
	inherits(Whowas, Command);
	Whowas.prototype.command = 'WHOWAS';

	var UserHost = function(nicks) {
		Command.call(this);
		this.setMiddle(nicks);
	};
	inherits(UserHost, Command);
	UserHost.prototype.command = 'USERHOST';

	return {
		Away: Away,
		Invite: Invite,
		IsOn: IsOn,
		Join: Join,
		Kick: Kick,
		List: List,
		Names: Names,
		Nick: Nick,
		Notice: Notice,
		Part: Part,
		Pass: Pass,
		Ping: Ping,
		Pong: Pong,
		PrivMsg: PrivMsg,
		Quit: Quit,
		Topic: Topic,
		User: User,
		Who: Who,
		Whois: Whois,
		Whowas: Whowas,
		UserHost: UserHost,
		GetMode: GetMode,
		SetMode: SetMode
	};
})();
