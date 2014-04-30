var Client = require('../src/client/client.js').Client;
var Requests = require('../src/core/requests.js');

module.exports = (function spirc_export() {
	return {
		Client: Client,
		Requests: Requests
	};
})();
