var inherits = require('util').inherits;

var Request = require('./message.js').Request;

module.exports = (function commands_export() {
	var Away = function(message) {
		Request.call(this);
		this.setCommand('AWAY');
		this.setParams(message);
	};
	inherits(Away, Request);

	var GetMode = function(chan) {
		Request.call(this);
		this.setCommand('MODE');
		this.setParams(chan);
	};
	inherits(GetMode, Request);

	var Invite = function(nick, chan) {
		Request.call(this);
		this.setCommand('INVITE');
		this.setParams(nick, chan);
	};
	inherits(Invite, Request);

	var IsOn = function(nick) {
		Request.call(this);
		this.setCommand('ISON');
		this.setParams(nick);
	};
	inherits(IsOn, Request);

	var Join = function(chan, key) {
		Request.call(this);
		this.setCommand('JOIN');
		this.setParams(chan, key);
	};
	inherits(Join, Request);

	var Kick = function(chan, nick, message) {
		Request.call(this);
		this.setCommand('KICK');
		this.setParams(chan, nick, message);
	};
	inherits(Kick, Request);

	var List = function(chan) {
		Request.call(this);
		this.setCommand('LIST');
		this.setParams(chan);
	};
	inherits(List, Request);

	var Names = function(chan) {
		Request.call(this);
		this.setCommand('NAMES');
		this.setParams(chan);
	};
	inherits(Names, Request);

	var Nick = function(nick) {
		Request.call(this);
		this.setCommand('NICK');
		this.setParams(nick);
	};
	inherits(Nick, Request);

	var Notice = function(target, message) {
		Request.call(this);
		this.setCommand('NOTICE');
		this.setParams(target, message);
	};
	inherits(Notice, Request);

	var Part = function(chan, message) {
		Request.call(this);
		this.setCommand('PART');
		this.setParams(chan, message);
	};
	inherits(Part, Request);

	var Pass = function(pass) {
		Request.call(this);
		this.setCommand('PASS');
		this.setParams(pass);
	};
	inherits(Pass, Request);

	var Ping = function(ping) {
		Request.call(this);
		this.setCommand('PING');
		this.setParams(ping);
	};
	inherits(Ping, Request);

	var Pong = function(pong) {
		Request.call(this);
		this.setCommand('PONG');
		this.setParams(pong);
	};
	inherits(Pong, Request);

	var PrivMsg = function(target, message) {
		Request.call(this);
		this.setCommand('PRIVMSG');
		this.setParams(target, message);
	};
	inherits(PrivMsg, Request);

	var Quit = function(message) {
		Request.call(this);
		this.setCommand('QUIT');
		this.setParams(message);
	};
	inherits(Quit, Request);

	var SetMode = function(target, mode) {
		Request.call(this);
		this.setCommand('MODE');
		this.setParams(target, mode);
	};
	inherits(SetMode, Request);

	var Topic = function(chan, topic) {
		Request.call(this);
		this.setCommand('TOPIC');
		this.setParams(chan, topic);
	};
	inherits(Topic, Request);

	var User = function(username, hostname, servername, realname) {
		Request.call(this);
		this.setCommand('USER');
		this.setParams(username, hostname, servername, realname);
	};
	inherits(User, Request);

	var Who = function(criteric) {
		Request.call(this);
		this.setCommand('WHO');
		this.setParams(criteric);
	};
	inherits(Who, Request);

	var Whois = function(nick) {
		Request.call(this);
		this.setCommand('WHOIS');
		this.setParams(nick);
	};
	inherits(Whois, Request);

	var Whowas = function(nick) {
		Request.call(this);
		this.setCommand('WHOWAS');
		this.setParams(nick);
	};
	inherits(Whowas, Request);

	var UserHost = function(nicks) {
		Request.call(this);
		this.setCommand('USERHOST');
		this.setParams(nicks);
	};
	inherits(UserHost, Request);

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
