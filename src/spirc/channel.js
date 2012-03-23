
var Channel = function(name, nameFilter) {
	var self = this;
	if (typeof(nameFilter) === 'function') {
		self.nameFilter = nameFilter;
	}
	self.name = self.nameFilter(name);
};
Channel.prototype = {
	constructor: Channel,
	nameFilter: function(name) {
		var self = this;
		var filteredName = '';

		var hasValidStartToken = false;
		var p=0;
		var plen=Channel.startToken.length;
		for (; p<plen; p++) {
			if (name.indexOf(Channel.startToken[p]) == 0) {
				hasValidStartToken = true;
				break;
			}
		}
		if (!hasValidStartToken) {
			filteredName += Channel.defaultToken;
		}

		var illegalCharIndex = -1;
		p=0;
		plen=Channel.illegalTokens.length;
		for (; p<plen; p++) {
			illegalCharIndex = name.indexOf(Channel.illegalTokens[p]);
			if (name.indexOf(illegalChar) != -1) {
				throw "Channel contains illegal character at position " + illegalCharIndex + ": " + channel;
			}
		}
		filteredName += name;
		filteredName = filteredName.substring(0, Channel.charLimit - 1);
		return filteredName;
	}
};
Channel.defaultToken = '#';
Channel.startToken = ['#', '&', '!', '+'];
Channel.charLimit = 50;
Channel.illegalTokens = [' ', ',', String.fromCharCode(7)];


exports.Channel = Channel;
