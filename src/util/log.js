module.exports = (function log_exports() {
	var Log = function(stream) {
		this.stream = stream;
	};

	Log.prototype.write = function(prefix, message) {
		if (this.stream != null) {
			this.stream.write(prefix + ':\t' + message + '\n');
		}
	};

	Log.prototype.info = function() {
		var args = ['Info'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);
	};

	Log.prototype.warn = function() {
		var args = ['Warn'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);	
	}

	Log.prototype.error = function() {
		var args = ['Error'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);
	}

	return {
		Log: Log
	};
})();