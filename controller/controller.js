var Config = require('../common/config.js');
Config.init(false, function() {
	var controllerName = 'primary';
	var iCanHazSerial = false;

	// Original source for UDP listener code:
	//   http://www.robertprice.co.uk/robblog/2011/03/writing_a_udp_server_using_node_js-shtml/

	var dgram = require("dgram");

	var server = dgram.createSocket("udp4");

	server.on("message", function (msg, rinfo) {
		var lights = JSON.parse(""+msg);
		
		if (iCanHazSerial) {
			var numChanged = 0;
			Object.keys(lights).forEach(function(channelName) {
				if (typeof Config.channelMap[channelName] !== 'undefined' && Config.channelMap[channelName].controller == controllerName) {
					console.log("Setting channel " + Config.channelMap[channelName].channel + " to brightness " + lights[channelName]);
					serialPort.write("SET," + Config.channelMap[channelName].channel + "," + lights[channelName]+"\n", function(err, results) {});
					numChanged++;
				}
			});
			if (numChanged > 0) {
				serialPort.write("EXE\n", function(err, results) {});
			}
		} 
	});

	server.on("listening", function () {
		var address = server.address();
		console.log("server listening " + address.address + ":" + address.port);
	});

	server.on("error", function (exception) {
		console.log("Exception: " + exception);
		if (iCanHazSerial) {
			serialPort.write("OFF\n", function(err, results) {});
		}
	});
	server.bind(43278, '127.0.0.1');
	
	var SerialPort = require("serialport").SerialPort
	var serialPort = new SerialPort(Config.controllers[controllerName].serialPort, {
		baudrate: 19200,
		databits: 8,
		stopbits: 1,
		parity: 'none',
	});

	serialPort.on("open", function () {
		console.log('Serial port open...');
		iCanHazSerial = true;

		serialPort.on('data', function(data) {
			console.log('Serial ACK: ' + data);
		});
	});

});

