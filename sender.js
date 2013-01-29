// Original source for UDP sender code:
//   http://www.robertprice.co.uk/robblog/2011/03/using_node_js_to_send_a_heartbeat_to_a_python_server-shtml/

var dgram = require('dgram');
var message = new Buffer("PyHB");
var server_ip = '127.0.0.1';
var server_port = 43278;
var beat_period = 1;
var debug = 1;

console.log("Sending heartbeat to IP " + server_ip + " , port " + server_port);
console.log("press Ctrl-C to stop");

var client = dgram.createSocket("udp4");

client.on("error", function (exception) {
	console.log("Exception: " + exception);
});

setInterval(function() {
	client.send(message, 0, message.length, server_port, server_ip);
	if (debug)
		console.log("Time: " + new Date());
}, beat_period * 1000);
