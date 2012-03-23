var util = require('util');

var TokenReader = function(stream, opts) {
	var self = this;

	self.opts = {
		delimiter: '\n'
	};

	if (typeof(opts) == 'object') {
		var keys = Object.keys(self.opts);
		for (var i=0; i<keys.length; i++) {
			var k = keys[i];
			if (opts[k] !== undefined) {
				self.opts[k] = opts[k];
			}
		}
	}

	var buffer = '';
	stream.addListener('data', function(chunk) {
		buffer += chunk;
		var tokens = buffer.split(self.opts.delimiter);
		var lastIndex = buffer.lastIndexOf(self.opts.delimiter);
		if (lastIndex == buffer.length - 1 - self.opts.delimiter.length) {
			buffer = '';
		} else {
			buffer = tokens.pop();
		}

		for (var i=0, len=tokens.length; i<len; i++) {
			self.emit('onTokenFound', tokens[i]);
		}
	});
};
util.inherits(TokenReader, process.EventEmitter);

exports.TokenReader = TokenReader;
