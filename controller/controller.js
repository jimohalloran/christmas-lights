var Config = require('../common/config.js');
Config.init(function() {

	// Original source for UDP listener code:
	//   http://www.robertprice.co.uk/robblog/2011/03/writing_a_udp_server_using_node_js-shtml/

	var dgram = require("dgram");

	var server = dgram.createSocket("udp4");

	server.on("message", function (msg, rinfo) {
		console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
	});

	server.on("listening", function () {
		var address = server.address();
		console.log("server listening " + address.address + ":" + address.port);
	});

	server.on("error", function (exception) {
		console.log("Exception: " + exception);
	});
	server.bind(43278, '127.0.0.1');
	
});

