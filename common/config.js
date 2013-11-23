
var	_fs = require('fs');
var _configFile = __dirname + '/../master.json';
var _formationFile = __dirname + '/../formations.json';
var _sequenceFile = __dirname + '/../sequences.json';
var _displayFile = __dirname + '/../display.json';
	
exports.controllers = {};
exports.lights = {};
exports.channelMap = {};
exports.formations = {};
exports.sequences = {};
exports.display = {};

function _buildChannelMap() {
	Object.keys(exports.controllers).forEach(function(controllerId) { 
		var controller = exports.controllers[controllerId];
		switch (controller.type) {
			case "arduinotlc":
				controller.channels.forEach(function(channelName, channelNum) {
					exports.channelMap[channelName] = {
						"controller": controllerId, 
						"channel": channelNum
					};
				});
				break;
		}
	});
}


function _validateLights() {
	var isLightConfigValid = true;
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


function _validateFormations() {
	var isFormationConfigValid = true;
	Object.keys(exports.formations).forEach(function(formationId) {
		exports.formations[formationId].forEach(function(lightId, idx) {
			if (exports.lights[lightId] == undefined) {
				console.log("Formation "+formationId+" uses undefined light "+lightId+" at index "+idx);
				isFormationConfigValid = false;
			}
		});
	});

	if (!isFormationConfigValid) {
		process.exit(1);
	}
}


function _validateSequences() {
	var isSequenceValid = true;

	Object.keys(exports.sequences).forEach(function(sequenceId) {
		exports.sequences[sequenceId].pattern.forEach(function(pattern, idx) {
			if (pattern.form != undefined) {
				if (exports.formations[pattern.form] == undefined) {
					console.log("Sequence "+sequenceId+" uses an undefined formation "+pattern.form+" at "+idx)
					isSequenceValid = false;
				}
			} else {
				if (exports.sequences[pattern.seq] == undefined) {
					console.log("Sequence "+sequenceId+" uses an undefined sequence "+pattern.seq+" at "+idx)
					isSequenceValid = false;
				}
			}
		});
	});

	if (!isSequenceValid) {
		process.exit(1);
	}
}


function _validateDisplay() {
	var isDisplayValid = true;

	exports.display.sequences.forEach(function(sequence, idx){
		if (exports.sequences[sequence.seq] == undefined) {
			console.log("The display uses an undefined sequence "+sequence.seq+" at "+idx)
			isDisplayValid = false;
		}
	});

	if (!isDisplayValid) {
		process.exit(1);
	}
}


exports.init = function(initEverything, cb) {
	_fs.readFile(_configFile, 'utf8', function(err, data) { 
		if (err) {
			console.log('Error: ' + err);
			return; 
		}

		var config = JSON.parse(data);
		exports.controllers = config.controllers;
		
		if (initEverything) {
			_buildChannelMap();
			
			exports.lights = config.lights;
			_validateLights();

			_fs.readFile(_formationFile, 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					return; 
				}

				exports.formations = JSON.parse(data);
				_validateFormations();

				_fs.readFile(_sequenceFile, 'utf8', function(err, data) {
					if (err) {
						console.log('Error: ' + err);
						return; 
					}

					exports.sequences = JSON.parse(data);
					_validateSequences();
					
					_fs.readFile(_displayFile, 'utf8', function(err, data) {
						if (err) {
							console.log('Error: ' + err);
							return; 
						}

						exports.display = JSON.parse(data);
						_validateDisplay();
						
						cb();
					});
				});

			});
		} else {
			cb();
		}
	});
};
