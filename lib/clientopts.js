var ClientOpts = function(opts) {
	var self = this;
	self.server = 'irc.freenode.net';
	self.port = 6667;
	self.nick = null;
	self.user = null;
	self.pass = null;

	if (typeof(opts) == 'object') {
		var keys = Object.keys(self);
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			if (opts[k] !== undefined) {
				self[k] = opts[k];
			}
		}
	}
};

exports.ClientOpts = ClientOpts;
