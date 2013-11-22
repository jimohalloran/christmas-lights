
var Config = {

	_fs: require('fs'),
	_file: __dirname + '/../master.json',
	
	controllers: {},
	lights: {},
	channelMap: {},
	
	init: function() {
		this._fs.readFile(this._file, 'utf8', function (err, data) { 
			if (err) {
				console.log('Error: ' + err);
				return; 
			}

			var master = JSON.parse(data);
			Config.controllers = master.controllers;
			Config.lights = master.lights;
			Config._buildChannelMap();
			Config._validateLights();
		});
	},

	_buildChannelMap: function() {
		Object.keys(this.controllers).forEach(function(nodeId) { 
			var node = Config.controllers[nodeId];
			switch (node.type) {
				case "arduinotlc":
					node.channels.forEach(function(channelName, channelNum) {
						Config.channelMap[channelName] = {
							"node": nodeId, 
							"channel": channelNum
						};
					});
					break;
			}
		});
	},

	_validateLights: function() {
		isLightConfigValid = true;
		Object.keys(this.lights).forEach(function(lightId) {
			var light = Config.lights[lightId];
			switch (light.type) {
				case "rgb":
					light.channels.forEach(function(channelName, idx) {
						if (Config.channelMap[channelName] == undefined) {
							console.log("Channel "+channelName+" at index "+idx+" of light "+lightId+" is undefined.");
							isLightConfigValid = false;
						}
					});
					break;
				
				case "mono":
					if (Config.channelMap[light.channel] == undefined) {
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
};

Config.init();