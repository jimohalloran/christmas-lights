
var	_fs = require('fs');
var _file = __dirname + '/../master.json';
	
exports.controllers = {};
exports.lights = {};
exports.channelMap = {};

function _buildChannelMap() {
	Object.keys(exports.controllers).forEach(function(nodeId) { 
		var node = exports.controllers[nodeId];
		switch (node.type) {
			case "arduinotlc":
				node.channels.forEach(function(channelName, channelNum) {
					exports.channelMap[channelName] = {
						"node": nodeId, 
						"channel": channelNum
					};
				});
				break;
		}
	});
}

function _validateLights() {
	isLightConfigValid = true;
	Object.keys(exports.lights).forEach(function(lightId) {
		var light = exports.lights[lightId];
		switch (light.type) {
			case "rgb":
				light.channels.forEach(function(channelName, idx) {
					if (exports.channelMap[channelName] == undefined) {
						console.log("Channel "+channelName+" at index "+idx+" of light "+lightId+" is undefined.");
						isLightConfigValid = false;
					}
				});
				break;
			
			case "mono":
				if (exports.channelMap[light.channel] == undefined) {
					console.log("Channel "+light.channel+" of light "+lightId+" is undefined.");
					isLightConfigValid = false;
				}
				break;
		}
	});

	if (!isLightConfigValid) {
		process.exit(1);
	}
}

	
exports.init = function(cb) {
	_fs.readFile(_file, 'utf8', function (err, data) { 
		if (err) {
			console.log('Error: ' + err);
			return; 
		}

		var master = JSON.parse(data);
		exports.controllers = master.controllers;
		exports.lights = master.lights;
		_buildChannelMap();
		_validateLights();
		cb();
	});
};
