// Tree Formation:
//
//       1
//     2   3
//   4   5   6
// 7   8   9   10

var Config = require('../common/config.js');


var Display = {
	_displayPatterns: [],
	_nextIdx: 0,

	getNextPattern: function() {
		if (this._displayPatterns.length == 0) {
			console.log("Generating display...");
			this._generateDisplay();
		}

		if (this._nextIdx >= this._displayPatterns.length) {
			if (Config.display.repeat) {
				this._nextIdx = 0;
			} else {
				return null;
			}
		}

		return this._displayPatterns[this._nextIdx++];
	},

	_generateDisplay: function() {
		this._displayPatterns = [];

		Config.display.sequences.forEach(function(sequence) {
			Display._displayPatterns = Display._displayPatterns.concat(Sequences.generateSequence(sequence));
		});

	},

	getBeatInterval: function() {
		return 60000 / Config.display.beatsPerMinute;
	}
}

var Sequences = {
	generateSequence: function(seq, colours) {
		var patterns = [];

		// If the pattern or sequence can accpet optional colour values, make sure the correct number were passed. 
		if (seq.colours != undefined) {
			if (!Array.isArray(colours)) {
				colours = [colours];
			}
			if (seq.colours >= 1 && colours.length != seq.colours) {
				console.log("Warning: Incorrect number of colours supplied for pattern.");
			}
		}

		// If the sequence contains multiple patterns, generate each pattern in turn.
		if (seq.pattern != undefined) {
			seq.pattern.forEach(function(seq) {
				patterns = patterns.concat(Sequences.generateSequence(seq, colours));
			})
		}

		// If the sequence item is itself a sequence, generate out the sequence first.
		if (seq.seq != undefined) {
			if (seq.colour == undefined) {
				seq.colour = [];
			}
			patterns = patterns.concat(Sequences.generateSequence(Config.sequences[seq.seq], seq.colour))
		}

		// Sequence item references a formation of lights
		if (seq.form != undefined) {
			var patternColour = this._generateColour(seq.colour, colours);
			patterns = patterns.concat({"lights": Config.formations[seq.form], "colour": patternColour});
		}

		// Append a copy of the generated pattern to itself once per repeat.
		if (seq.repeats != undefined && seq.repeats > 1) {
			var singlePattern = patterns;
			for (var i = 2; i <= seq.repeats; i++) {
				patterns = patterns.concat(singlePattern);
			}
		}

		return patterns;
	},

	_generateColour: function(colourIndex, colours) {
		if (colourIndex === 0) {
			return [0, 0, 0];
		} else if (parseInt(colourIndex) != NaN) {
			return this._htmlColourToRgbArray(colours[colourIndex-1]);
		} else if (colourIndex.match(/#[0-9a-f]{6}/)) {
			return this._htmlColourToRgbArray(colourIndex);
		}

		return null;
	},

	_htmlColourToRgbArray: function(htmlColour) {
		htmlComponents = htmlColour.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/).slice(1, 4);
		htmlComponents.forEach(function(value, index, arr) {
			arr[index] = parseInt("0x"+value);
		});
		return htmlComponents;
	} 
}


var ChannelState = {
	_currentState: {},

	init: function() {
		// Zero out all channels.
		this._currentState = this.getLightsOut();
	},

	getLightsOut: function() {
		var lightsOut = {};
		Object.keys(Config.channelMap).forEach(function(channelName) {
			lightsOut[channelName] = 0;
		});
		return lightsOut;
	},

	generateChannelDiff: function(pattern) {
		var processed = {};
		var lightsChanged = {};

		pattern.lights.forEach(function(lightId) {
			var channels = ChannelState._mapLightToChannels(lightId);
			channels.forEach(function(channelName, idx) {
				processed[channelName] = true;
				var newValue = pattern.colour[idx];
				if (newValue != ChannelState._currentState[channelName]) {
					lightsChanged[channelName] = newValue;
				}
			});
		});

		// Turn off any lights that were on
		Object.keys(this._currentState).forEach(function(channelName) {
			if (processed[channelName] == undefined && ChannelState._currentState[channelName] != 0) {
				lightsChanged[channelName] = 0;
			}
		});

		return lightsChanged;
	},

	updateChannelState: function(diff) {
		Object.keys(diff).forEach(function(channelName) {
			ChannelState._currentState[channelName] = diff[channelName];
		});
	},

	_mapLightToChannels: function(lightId) {
		return Config.lights[lightId].channels;
	}
}


Config.init(true, function() {

	// Original source for UDP sender code:
	//   http://www.robertprice.co.uk/robblog/2011/03/using_node_js_to_send_a_heartbeat_to_a_python_server-shtml/

	var dgram = require('dgram');
	var server_ip = '127.0.0.1';
	var server_port = 43278;
	var beat_period = 1;
	var debug = 1;

	ChannelState.init();
	var lightsOut = new Buffer(JSON.stringify(ChannelState.getLightsOut()));

	console.log("Sending light instructions to IP " + server_ip + " , port " + server_port);
	console.log("press Ctrl-C to stop");

	var client = dgram.createSocket("udp4");

	client.on("error", function (exception) {
		console.log("Exception: " + exception);
		client.send(lightsOut, 0, lightsOut.length, server_port, server_ip);
	});

	client.send(lightsOut, 0, lightsOut.length, server_port, server_ip);

	setInterval(function() {
		var pattern = Display.getNextPattern();
		if (pattern == null) {
			client.send(lightsOut, 0, lightsOut.length, server_port, server_ip, function() {
				process.exit(0);
			});
		} else {
			var diff = ChannelState.generateChannelDiff(pattern);
			var message = new Buffer(JSON.stringify(diff));
			client.send(message, 0, message.length, server_port, server_ip);
			ChannelState.updateChannelState(diff);
		}
	}, Display.getBeatInterval());

});