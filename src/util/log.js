module.exports = (function log_exports() {
	var Log = function Log(stream) {
		this.stream = stream;
	};

	Log.prototype.write = function write(prefix, message) {
		if (this.stream != null) {
			this.stream.write(prefix + ':\t' + message + '\n');
		}
	};

	Log.prototype.info = function info() {
		var args = ['Info'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);
	};

	Log.prototype.warn = function warn() {
		var args = ['Warn'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);	
	}

	Log.prototype.error = function error() {
		var args = ['Error'];
		Array.prototype.push.apply(args, arguments);
		this.write.apply(this, args);
	}

	return {
		Log: Log
	};
})();