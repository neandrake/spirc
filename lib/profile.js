
var Profile = function() {
	var self = this;
	self.user = null;
	self.nick = null;
	self.real = null;
	self.pass = null;
	self.host = null;
};
Profile.prototype = {
	constructor: Profile
};


exports.Profile = Profile
