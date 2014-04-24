var Client = require('../src/client/client.js').Client;
var Commands = require('../src/core/commands.js');

module.exports = (function spirc_export() {
	return {
		Client: Client,
		Commands: Commands
	};
})();
