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
		this.cmdtype = line.substring(curSpaceIndex, nextSpaceIndex);
	} else {
		this.cmdtype = line.substring(curSpaceIndex);
	}
	if (parseInt(this.cmdtype) !== NaN) {
		this.cmdcode = this.cmdtype;
		this.cmdtype = undefined;
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
	}

	if (this.middle !== undefined && this.middle !== null) {
		val += this.middle + ' ';
	}
	if (this.trailing !== undefined && this.trailing !== null) {
		val += this.trailing;
	}
	return val;
};
Response.prototype.raw = function() {
	var val = '';
	if (this.prefix !== undefined && this.prefix !== null) {
		val += this.prefix.raw();
		val += ' ';
	}
	
	if (this.cmdcode != null) {
		val += this.cmdcode;
	} else if (this.cmdtype != null) {
		val += this.cmdtype;
	}

	if (this.middle !== undefined && this.middle !== null) {
		val += ' ' + this.middle;
	}
	if (this.trailing !== undefined && this.trailing !== null) {
		val += ' :' + this.trailing;
	}
	val += msg.Message.delim;
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

var RplWelcome = function(response) {
	Response.call(this, response);
};
util.inherits(RplWelcome, Response);
RplWelcome.prototype.cmdtype = 'RPL_WELCOME';
RplWelcome.prototype.cmdcode = '001';

var RplYourHost = function(response) {
	Response.call(this, response);
};
util.inherits(RplYourHost, Response);
RplYourHost.prototype.cmdtype = 'RPL_YOURHOST';
RplYourHost.prototype.cmdcode = '002';

var RpleCreated = function(response) {
	Response.call(this, response);
};
util.inherits(RpleCreated, Response);
RpleCreated.prototype.cmdtype = 'RPL_CREATED';
RpleCreated.prototype.cmdcode = '003';

var RplMyInfo = function(response) {
	Response.call(this, response);
};
util.inherits(RplMyInfo, Response);
RplMyInfo.prototype.cmdtype = 'RPL_MYINFO';
RplMyInfo.prototype.cmdcode = '004';

var RplISupport = function(response) {
	Response.call(this, response);
};
util.inherits(RplISupport, Response);
RplISupport.prototype.cmdtype = 'RPL_ISUPPORT';
RplISupport.prototype.cmdcode = '005';

var RplNone = function(response) {
	Response.call(this, response);
};
util.inherits(RplNone, Response);
RplNone.prototype.cmdtype = 'RPL_NONE';
RplNone.prototype.cmdcode = '300';

var RplAway = function(response) {
	Response.call(this, response);
};
util.inherits(RplAway, Response);
RplAway.prototype.cmdtype = 'RPL_AWAY';
RplAway.prototype.cmdcode = '301';

var RplUserHost = function(response) {
	Response.call(this, response);
};
util.inherits(RplUserHost, Response);
RplUserHost.prototype.cmdtype = 'RPL_USERHOST';
RplUserHost.prototype.cmdcode = '302';

var RplIsOn = function(response) {
	Response.call(this, response);
};
util.inherits(RplIsOn, Response);
RplIsOn.prototype.cmdtype = 'RPL_ISON';
RplIsOn.prototype.cmdcode = '303';

var RplUnaway = function(response) {
	Response.call(this, response);
};
util.inherits(RplUnaway, Response);
RplUnaway.prototype.cmdtype = 'RPL_UNAWAY';
RplUnaway.prototype.cmdcode = '305';

var RplNoAway = function(response) {
	Response.call(this, response);
};
util.inherits(RplNoAway, Response);
RplNoAway.prototype.cmdtype = 'RPL_NOAWAY';
RplNoAway.prototype.cmdcode = '306';

var RplWhoisUser = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoisUser, Response);
RplWhoisUser.prototype.cmdtype = 'RPL_WHOISUSER';
RplWhoisUser.prototype.cmdcode = '311';

var RplWhoisServer = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoisServer, Response);
RplWhoisServer.prototype.cmdtype = 'RPL_WHOISSERVER';
RplWhoisServer.prototype.cmdcode = '312';

var RplWhoisOperator = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoisOperator, Response);
RplWhoisOperator.prototype.cmdtype = 'RPL_WHOISOPERATOR';
RplWhoisOperator.prototype.cmdcode = '313';

var RplWhoWasUser = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoWasUser, Response);
RplWhoWasUser.prototype.cmdtype = 'RPL_WHOWASUSER';
RplWhoWasUser.prototype.cmdcode = '314';

var RplWhoisIdle = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoisIdle, Response);
RplWhoisIdle.prototype.cmdtype = 'RPL_WHOISIDLE';
RplWhoisIdle.prototype.cmdcode = '317';

var RplEndOfWhois = function(response) {
	Response.call(this, response);
};
util.inherits(RplEndOfWhois, Response);
RplEndOfWhois.prototype.cmdtype = 'RPL_ENDOFWHOIS';
RplEndOfWhois.prototype.cmdcode = '318';

var RplWhoisChannels = function(response) {
	Response.call(this, response);
};
util.inherits(RplWhoisChannels, Response);
RplWhoisChannels.prototype.cmdtype = 'RPL_WHOISCHANNELS';
RplWhoisChannels.prototype.cmdcode = '319';

var RplListStart = function(response) {
	Response.call(this, response);
};
util.inherits(RplListStart, Response);
RplListStart.prototype.cmdtype = 'RPL_LISTSTART';
RplListStart.prototype.cmdcode = '321';

var RplList = function(response) {
	Response.call(this, response);
};
util.inherits(RplList, Response);
RplList.prototype.cmdtype = 'RPL_LIST';
RplList.prototype.cmdcode = '322';

var RplListEnd = function(response) {
	Response.call(this, response);
};
util.inherits(RplListEnd, Response);
RplListEnd.prototype.cmdtype = 'RPL_LISTEND';
RplListEnd.prototype.cmdcode = '323';

var RplChannelModeIs = function(response) {
	Response.call(this, response);
};
util.inherits(RplChannelModeIs, Response);
RplChannelModeIs.prototype.cmdtype = 'RPL_CHANNELMODEIS';
RplChannelModeIs.prototype.cmdcode = '324';

var RplNoTopic = function(response) {
	Response.call(this, response);
};
util.inherits(RplNoTopic, Response);
RplNoTopic.prototype.cmdtype = 'RPL_NOTOPIC';
RplNoTopic.prototype.cmdcode = '331';

var RplTopic = function(response) {
	Response.call(this, response);
};
util.inherits(RplTopic, Response);
RplTopic.prototype.cmdtype = 'RPL_TOPIC';
RplTopic.prototype.cmdcode = '332';

var RplTopicInfo = function(response) {
	Response.call(this, response);
};
util.inherits(RplTopicInfo, Response);
RplTopicInfo.prototype.cmdtype = 'RPL_TOPICINFO';
RplTopicInfo.prototype.cmdcode = '333';

var RplAuthName = function(response) {
	Response.call(this, response);
};
util.inherits(RplAuthName, Response);
RplAuthName.prototype.cmdtype = 'RPL_AUTHNAME';
RplAuthName.prototype.cmdcode = '333';

var RplEndOfWhowas = function(response) {
	Response.call(this, response);
};
util.inherits(RplEndOfWhowas, Response);
RplEndOfWhowas.prototype.cmdtype = 'RPL_ENDOFWHOWAS';
RplEndOfWhowas.prototype.cmdcode = '369';






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

var ErrUserOnChannel = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNotOnChannel, Response);
ErrUserOnChannel.prototype.cmdtype = 'ERR_USERONCHANNEL';
ErrUserOnChannel.prototype.cmdcode = '443';

var ErrNoLogin = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNotOnChannel, Response);
ErrNoLogin.prototype.cmdtype = 'ERR_NOLOGIN';
ErrNoLogin.prototype.cmdcode = '444';

var ErrSummonDisabled = function(response) {
	Response.call(this, response);
};
util.inherits(ErrSummonDisabled, Response);
ErrSummonDisabled.prototype.cmdtype = 'ERR_SUMMONDISABLED';
ErrSummonDisabled.prototype.cmdcode = '445';

var ErrUserDisabled = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUserDisabled, Response);
ErrUserDisabled.prototype.cmdtype = 'ERR_USERDISABLED';
ErrUserDisabled.prototype.cmdcode = '446';

var ErrNotRegistered = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNotRegistered, Response);
ErrNotRegistered.prototype.cmdtype = 'ERR_NOTREGISTERED';
ErrNotRegistered.prototype.cmdcode = '451';

var ErrNeedMoreParams = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNeedMoreParams, Response);
ErrNeedMoreParams.prototype.cmdtype = 'ERR_NEEDMOREPARAMS';
ErrNeedMoreParams.prototype.cmdcode = '461';

var ErrAlreadyRegistered = function(response) {
	Response.call(this, response);
};
util.inherits(ErrAlreadyRegistered, Response);
ErrAlreadyRegistered.prototype.cmdtype = 'ERR_ALREADYREGISTERED';
ErrAlreadyRegistered.prototype.cmdcode = '462';

var ErrNoPermForHost = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoPermForHost, Response);
ErrNoPermForHost.prototype.cmdtype = 'ERR_NOPERMFORHOST';
ErrNoPermForHost.prototype.cmdcode = '463';

var ErrPasswdMismatch = function(response) {
	Response.call(this, response);
};
util.inherits(ErrPasswdMismatch, Response);
ErrPasswdMismatch.prototype.cmdtype = 'ERR_PASSWDMISMATCH';
ErrPasswdMismatch.prototype.cmdcode = '464';

var ErrYoureBannedCreep = function(response) {
	Response.call(this, response);
};
util.inherits(ErrYoureBannedCreep, Response);
ErrYoureBannedCreep.prototype.cmdtype = 'ERR_YOUREBANNEDCREEP';
ErrYoureBannedCreep.prototype.cmdcode = '465';

var ErrKeySet = function(response) {
	Response.call(this, response);
};
util.inherits(ErrKeySet, Response);
ErrKeySet.prototype.cmdtype = 'ERR_KEYSET';
ErrKeySet.prototype.cmdcode = '467';

var ErrChannelIsFull = function(response) {
	Response.call(this, response);
};
util.inherits(ErrChannelIsFull, Response);
ErrChannelIsFull.prototype.cmdtype = 'ERR_CHANNELISFULL';
ErrChannelIsFull.prototype.cmdcode = '471';

var ErrUnknownMode = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUnknownMode, Response);
ErrUnknownMode.prototype.cmdtype = 'ERR_UNKNOWNMODE';
ErrUnknownMode.prototype.cmdcode = '471';

var ErrInviteOnlyChan = function(response) {
	Response.call(this, response);
};
util.inherits(ErrInviteOnlyChan, Response);
ErrInviteOnlyChan.prototype.cmdtype = 'ERR_INVITEONLYCHAN';
ErrInviteOnlyChan.prototype.cmdcode = '473';

var ErrBannedFromChan = function(response) {
	Response.call(this, response);
};
util.inherits(ErrBannedFromChan, Response);
ErrBannedFromChan.prototype.cmdtype = 'ERR_BANNEDFROMCHAN';
ErrBannedFromChan.prototype.cmdcode = '474';

var ErrBadChannelKey = function(response) {
	Response.call(this, response);
};
util.inherits(ErrBadChannelKey, Response);
ErrBadChannelKey.prototype.cmdtype = 'ERR_BADCHANNELKEY';
ErrBadChannelKey.prototype.cmdcode = '475';

var ErrNoPrivileges = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoPrivileges, Response);
ErrNoPrivileges.prototype.cmdtype = 'ERR_NOPRIVILEGES';
ErrNoPrivileges.prototype.cmdcode = '481';

var ErrChanOPrivsNeeded = function(response) {
	Response.call(this, response);
};
util.inherits(ErrChanOPrivsNeeded, Response);
ErrChanOPrivsNeeded.prototype.cmdtype = 'ERR_CHANOPRIVSNEEDED';
ErrChanOPrivsNeeded.prototype.cmdcode = '482';

var ErrCantKillServer = function(response) {
	Response.call(this, response);
};
util.inherits(ErrCantKillServer, Response);
ErrCantKillServer.prototype.cmdtype = 'ERR_CANTKILLSERVER';
ErrCantKillServer.prototype.cmdcode = '483';

var ErrNoOperHost = function(response) {
	Response.call(this, response);
};
util.inherits(ErrNoOperHost, Response);
ErrNoOperHost.prototype.cmdtype = 'ERR_NOOPERHOST';
ErrNoOperHost.prototype.cmdcode = '491';

var ErrUModeUknownFlag = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUModeUknownFlag, Response);
ErrUModeUknownFlag.prototype.cmdtype = 'ERR_UMODEUNKNOWNFLAG';
ErrUModeUknownFlag.prototype.cmdcode = '501';

var ErrUsersDontMatch = function(response) {
	Response.call(this, response);
};
util.inherits(ErrUsersDontMatch, Response);
ErrUsersDontMatch.prototype.cmdtype = 'ERR_USERSDONTMATCH';
ErrUsersDontMatch.prototype.cmdcode = '502';







var responses = [
	Notice,
	RplWelcome,
	RplYourHost,
	RpleCreated,
	RplMyInfo,
	RplISupport,
	RplNone,
	RplAway,
	RplUserHost,
	RplIsOn,
	RplUnaway,
	RplNoAway,
	RplWhoisUser,
	RplWhoisServer,
	RplWhoisOperator,
	RplWhoWasUser,
	RplWhoisIdle,
	RplEndOfWhois,
	RplWhoisChannels,
	RplListStart,
	RplList,
	RplListEnd,
	RplChannelModeIs,
	RplNoTopic,
	RplTopic,
	RplTopicInfo,
	RplAuthName,
	RplEndOfWhowas,


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
	ErrUserNotInChannel,
	ErrUserOnChannel,
	ErrNoLogin,
	ErrSummonDisabled,
	ErrUserDisabled,
	ErrNotRegistered,
	ErrNeedMoreParams,
	ErrAlreadyRegistered,
	ErrNoPermForHost,
	ErrPasswdMismatch,
	ErrYoureBannedCreep,
	ErrKeySet,
	ErrChannelIsFull,
	ErrUnknownMode,
	ErrInviteOnlyChan,
	ErrBannedFromChan,
	ErrBadChannelKey,
	ErrNoPrivileges,
	ErrChanOPrivsNeeded,
	ErrCantKillServer,
	ErrNoOperHost,
	ErrUModeUknownFlag,
	ErrUsersDontMatch,
];

var parse = function(line) {
	var asResponse = new Response(line);
	var rspCommand = asResponse.cmdcode;
	if (rspCommand == null && asResponse.cmdtype != null) {
		rspCommand = asResponse.cmdtype.toUpperCase();
	}

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
