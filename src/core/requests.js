var inherits = require('util').inherits;

var Outbound = require('./message.js').Outbound;

module.exports = (function commands_export() {
	var Away = function(message) {
		Outbound.call(this);
		this.setCommand('AWAY');
		this.setParams(message);
	};
	inherits(Away, Outbound);

	var GetMode = function(chan) {
		Outbound.call(this);
		this.setCommand('MODE');
		this.setParams(chan);
	};
	inherits(GetMode, Outbound);

	var Invite = function(nick, chan) {
		Outbound.call(this);
		this.setCommand('INVITE');
		this.setParams(nick, chan);
	};
	inherits(Invite, Outbound);

	var IsOn = function(nick) {
		Outbound.call(this);
		this.setCommand('ISON');
		this.setParams(nick);
	};
	inherits(IsOn, Outbound);

	var Join = function(chan, key) {
		Outbound.call(this);
		this.setCommand('JOIN');
		this.setParams(chan, key);
	};
	inherits(Join, Outbound);

	var Kick = function(chan, nick, message) {
		Outbound.call(this);
		this.setCommand('KICK');
		this.setParams(chan, nick, message);
	};
	inherits(Kick, Outbound);

	var List = function(chan) {
		Outbound.call(this);
		this.setCommand('LIST');
		this.setParams(chan);
	};
	inherits(List, Outbound);

	var Names = function(chan) {
		Outbound.call(this);
		this.setCommand('NAMES');
		this.setParams(chan);
	};
	inherits(Names, Outbound);

	var Nick = function(nick) {
		Outbound.call(this);
		this.setCommand('NICK');
		this.setParams(nick);
	};
	inherits(Nick, Outbound);

	var Notice = function(target, message) {
		Outbound.call(this);
		this.setCommand('NOTICE');
		this.setParams(target, message);
	};
	inherits(Notice, Outbound);

	var Part = function(chan, message) {
		Outbound.call(this);
		this.setCommand('PART');
		this.setParams(chan, message);
	};
	inherits(Part, Outbound);

	var Pass = function(pass) {
		Outbound.call(this);
		this.setCommand('PASS');
		this.setParams(pass);
	};
	inherits(Pass, Outbound);

	var Ping = function(ping) {
		Outbound.call(this);
		this.setCommand('PING');
		this.setParams(ping);
	};
	inherits(Ping, Outbound);

	var Pong = function(pong) {
		Outbound.call(this);
		this.setCommand('PONG');
		this.setParams(pong);
	};
	inherits(Pong, Outbound);

	var PrivMsg = function(target, message) {
		Outbound.call(this);
		this.setCommand('PRIVMSG');
		this.setParams(target, message);
	};
	inherits(PrivMsg, Outbound);

	var Quit = function(message) {
		Outbound.call(this);
		this.setCommand('QUIT');
		this.setParams(message);
	};
	inherits(Quit, Outbound);

	var SetMode = function(target, mode) {
		Outbound.call(this);
		this.setCommand('MODE');
		this.setParams(target, mode);
	};
	inherits(SetMode, Outbound);

	var Topic = function(chan, topic) {
		Outbound.call(this);
		this.setCommand('TOPIC');
		this.setParams(chan, topic);
	};
	inherits(Topic, Outbound);

	var User = function(username, hostname, servername, realname) {
		Outbound.call(this);
		this.setCommand('USER');
		this.setParams(username, hostname, servername, realname);
	};
	inherits(User, Outbound);

	var Who = function(criteric) {
		Outbound.call(this);
		this.setCommand('WHO');
		this.setParams(criteric);
	};
	inherits(Who, Outbound);

	var Whois = function(nick) {
		Outbound.call(this);
		this.setCommand('WHOIS');
		this.setParams(nick);
	};
	inherits(Whois, Outbound);

	var Whowas = function(nick) {
		Outbound.call(this);
		this.setCommand('WHOWAS');
		this.setParams(nick);
	};
	inherits(Whowas, Outbound);

	var UserHost = function(nicks) {
		Outbound.call(this);
		this.setCommand('USERHOST');
		this.setParams(nicks);
	};
	inherits(UserHost, Outbound);

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
