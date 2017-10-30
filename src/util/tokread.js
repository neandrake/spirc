var eventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = (function tokread_export() {
	var TokenReader = function TokenReader(stream, opts) {
		var self = this;

		self.opts = {
			encodings: 'utf8',
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
		stream.on('data', function _cb_onData(chunk) {
			buffer += chunk.toString(self.opts.encoding);
			var tokens = buffer.split(self.opts.delimiter);
			var lastIndex = buffer.lastIndexOf(self.opts.delimiter);
			if (lastIndex == buffer.length - 1 - self.opts.delimiter.length) {
				buffer = '';
			} else {
				buffer = tokens.pop();
			}

			for (var i=0, len=tokens.length; i<len; i++) {
				self.emit('token', tokens[i]);
			}
		});
	};
	inherits(TokenReader, eventEmitter);

	return {
		TokenReader: TokenReader
	};
})();
