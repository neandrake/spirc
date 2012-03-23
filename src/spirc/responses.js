var util = require('util')
var msg = require('./message.js');

var Response = function(response) {
	msg.Message.call(this, response);
	if (typeof(response) == 'string') {
		this.parse(response);
	}
};
util.inherits(Response, msg.Message);
Response.prototype.parse = function(line) {
	var len = line.length;
	var curSpaceIndex = 0;
	var nextSpaceIndex = -1;

	curSpaceIndex = line.indexOf(' ');
	if (line.indexOf(':') == 0) {
		this.prefix = new msg.Prefix(line.substring(0, curSpaceIndex));
	}

	while (line.charAt(curSpaceIndex) == ' ') {
		curSpaceIndex++;
	}

	nextSpaceIndex = line.indexOf(' ', curSpaceIndex);
	if (nextSpaceIndex != -1) {
		this.command = line.substring(curSpaceIndex, nextSpaceIndex);
	} else {
		this.command = line.substring(curSpaceIndex);
	}
	curSpaceIndex = nextSpaceIndex;

	if (curSpaceIndex < 0) {
		return;
	}

	while (curSpaceIndex < len && line.charAt(curSpaceIndex) == ' ') {
		curSpaceIndex++;
	}
	curSpaceIndex--;

	var trailIndex = line.indexOf(' :', curSpaceIndex);
	if (trailIndex != -1) {
		this.trailing = line.substring(trailIndex + 2);
	} else {
		trailIndex = line.lastIndexOf(' ');
		if (trailIndex != -1 && trailIndex > curSpaceIndex) {
			this.trailing = line.substring(trailIndex + 1);
		}
	}

	if (curSpaceIndex < trailIndex) {
		this.middle = line.substring(curSpaceIndex + 1, trailIndex);
	}

	if (this.middle != null) {
		this.params = [];
		var last = 0;
		var index = 0;
		var len = this.middle.length;
		while (index < len) {
			if (this.middle.charAt(index) == ' ') {
				this.params.push(this.middle.substring(last, index));
				last = index + 1;
			}
			index++;
		}
		if (last != len) {
			this.params.push(this.middle.substring(last));
		}
		if (this.trailing != null) {
			this.params.push(this.trailing);
		}
	}
};
Response.prototype.readable = function() {
	var val = '';
	if (this.cmdtype !== undefined && this.cmdtype !== null) {
		val += this.cmdtype + ' ';
	} else if (this.cmdcode !== undefined && this.cmdcode !== null) {
		val += this.cmdcode + ' ';
	} else if (this.command !== undefined && this.command !== null) {
		val += this.command + ' ';
	}

	if (this.middle !== undefined && this.middle !== null) {
		val += this.middle + ' ';
	}
	if (this.trailing !== undefined && this.trailing !== null) {
		val += this.trailing;
	}
	return val;
};

var Notice = function(response) {
	Response.call(this, response);
};
util.inherits(Notice, Response);
Notice.prototype.cmdtype = 'NOTICE';
Notice.prototype.readable = function() {
	return this.trailing;
}

var Welcome = function(response) {
	Response.call(this, response);
};
util.inherits(Welcome, Response);
Welcome.prototype.cmdtype = 'RPL_WELCOME';
Welcome.prototype.cmdcode = '001';

var YourHost = function(response) {
	Response.call(this, response);
};
util.inherits(YourHost, Response);
YourHost.prototype.cmdtype = 'RPL_YOURHOST';
YourHost.prototype.cmdcode = '002';

var Created = function(response) {
	Response.call(this, response);
};
util.inherits(Created, Response);
Created.prototype.cmdtype = 'RPL_CREATED';
Created.prototype.cmdcode = '003';

var MyInfo = function(response) {
	Response.call(this, response);
};
util.inherits(MyInfo, Response);
MyInfo.prototype.cmdtype = 'RPL_MYINFO';
MyInfo.prototype.cmdcode = '004';

var ISupport = function(response) {
	Response.call(this, response);
};
util.inherits(ISupport, Response);
ISupport.prototype.cmdtype = 'RPL_ISUPPORT';
ISupport.prototype.cmdcode = '005';



var ErrNoSuchNick = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoSuchNick, Response);
ErrNoSuchNick.prototype.cmdtype = 'ERR_NOSUCHNICK';
ErrNoSuchNick.prototype.cmdcode = '401';

var ErrNoSuchServer = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoSuchServer, Response);
ErrNoSuchServer.prototype.cmdtype = 'ERR_NOSUCHNICK';
ErrNoSuchServer.prototype.cmdcode = '402';

var ErrNoSuchChannel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoSuchChannel, Response);
ErrNoSuchChannel.prototype.cmdtype = 'ERR_NOSUCHCHANNEL';
ErrNoSuchChannel.prototype.cmdcode = '403';

var ErrCannotSendToChannel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrCannotSendToChannel, Response);
ErrCannotSendToChannel.prototype.cmdtype = 'ERR_CANNOTSENDTOCHANNEL';
ErrCannotSendToChannel.prototype.cmdcode = '404';

var ErrTooManyChannels = function(response) {
	Response.call(this, response);
};
util.inherits(ErrTooManyChannels, Response);
ErrTooManyChannels.prototype.cmdtype = 'ERR_TOOMANYCHANNELS';
ErrTooManyChannels.prototype.cmdcode = '405';

var ErrWasNoSuchNick = function(response) {
	Response.call(this, response);
};
util.inherits(ErrWasNoSuchNick, Response);
ErrWasNoSuchNick.prototype.cmdtype = 'ERR_WASNOSUCHNICK';
ErrWasNoSuchNick.prototype.cmdcode = '406';

var ErrTooManyTargets = function(response) {
	Response.call(this, response);
};
util.inherits(ErrTooManyTargets, Response);
ErrTooManyTargets.prototype.cmdtype = 'ERR_TOOMANYTARGETS';
ErrTooManyTargets.prototype.cmdcode = '407';

var ErrNoOrigin = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoOrigin, Response);
ErrNoOrigin.prototype.cmdtype = 'ERR_NOORIGIN';
ErrNoOrigin.prototype.cmdcode = '409';

var ErrNoRecipient = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoRecipient, Response);
ErrNoRecipient.prototype.cmdtype = 'ERR_NORECIPIENT';
ErrNoRecipient.prototype.cmdcode = '411';

var ErrNoTextToSend = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoTextToSend, Response);
ErrNoTextToSend.prototype.cmdtype = 'ERR_NOTEXTTOSEND';
ErrNoTextToSend.prototype.cmdcode = '412';

var ErrNoTopLevel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoTopLevel, Response);
ErrNoTopLevel.prototype.cmdtype = 'ERR_NOTOPLEVEL';
ErrNoTopLevel.prototype.cmdcode = '413';

var ErrWildTopLevel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrWildTopLevel, Response);
ErrWildTopLevel.prototype.cmdtype = 'ERR_WILDTOPLEVEL';
ErrWildTopLevel.prototype.cmdcode = '414';

var ErrUnknownCommand = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUnknownCommand, Response);
ErrUnknownCommand.prototype.cmdtype = 'ERR_UNKNOWNCOMMAND';
ErrUnknownCommand.prototype.cmdcode = '421';

var ErrNoMotd = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoMotd, Response);
ErrNoMotd.prototype.cmdtype = 'ERR_NOMOTD';
ErrNoMotd.prototype.cmdcode = '422';

var ErrNoAdminInfo = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoAdminInfo, Response);
ErrNoAdminInfo.prototype.cmdtype = 'ERR_NOADMININFO';
ErrNoAdminInfo.prototype.cmdcode = '423';

var ErrFileError = function(response) {
	Response.call(this, response);
};
util.inherits(ErrFileError, Response);
ErrFileError.prototype.cmdtype = 'ERR_FILEERROR';
ErrFileError.prototype.cmdcode = '424';

var ErrNoNickNameGiven = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoNickNameGiven, Response);
ErrNoNickNameGiven.prototype.cmdtype = 'ERR_NONICKNAMEGIVEN';
ErrNoNickNameGiven.prototype.cmdcode = '431';

var ErrErroneusNickname = function(response) {
	Response.call(this, response);
};
util.inherits(ErrErroneusNickname, Response);
ErrErroneusNickname.prototype.cmdtype = 'ERR_ERRONEUSNICKNAME';
ErrErroneusNickname.prototype.cmdcode = '432';

var ErrNickNameInUse = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNickNameInUse, Response);
ErrNickNameInUse.prototype.cmdtype = 'ERR_NICKNAMEINUSE';
ErrNickNameInUse.prototype.cmdcode = '433';

var ErrNickCollision = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNickCollision, Response);
ErrNickCollision.prototype.cmdtype = 'ERR_NICKCOLLISION';
ErrNickCollision.prototype.cmdcode = '436';

var ErrUserNotInChannel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUserNotInChannel, Response);
ErrUserNotInChannel.prototype.cmdtype = 'ERR_USERNOTINCHANNEL';
ErrUserNotInChannel.prototype.cmdcode = '441';

var ErrNotOnChannel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNotOnChannel, Response);
ErrNotOnChannel.prototype.cmdtype = 'ERR_NOTONCHANNEL';
ErrNotOnChannel.prototype.cmdcode = '442';




var responses = [
	Notice,
	Welcome,
	YourHost,
	Created,
	MyInfo,
	ISupport,
	ErrNoSuchNick,
	ErrNoSuchServer,
	ErrNoSuchChannel,
	ErrCannotSendToChannel,
	ErrTooManyChannels,
	ErrWasNoSuchNick,
	ErrTooManyTargets,
	ErrNoOrigin,
	ErrNoRecipient,
	ErrNoTextToSend,
	ErrNoTopLevel,
	ErrWildTopLevel,
	ErrUnknownCommand,
	ErrNoMotd,
	ErrNoAdminInfo,
	ErrFileError,
	ErrNoNickNameGiven,
	ErrErroneusNickname,
	ErrNickNameInUse,
	ErrNickCollision,
	ErrUserNotInChannel
];

var parse = function(line) {
	var asResponse = new Response(line);
	var rspCommand = asResponse.command.toUpperCase();
	var rsp = null;
	for (var i=0, len=responses.length; i<len; i++) {
		rsp = responses[i];
		if (rsp.prototype.cmdtype == rspCommand || rsp.prototype.cmdcode == rspCommand) {
			return new rsp(asResponse);
		}
	}
	return asResponse;
};


exports.parse = parse;
