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
			var patternColour = this.generateColour(seq.colour, colours);
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

	generateColour: function(colourIndex, colours) {
		return 0;
	} 
}

Config.init(true, function() {

	// Original source for UDP sender code:
	//   http://www.robertprice.co.uk/robblog/2011/03/using_node_js_to_send_a_heartbeat_to_a_python_server-shtml/

	var dgram = require('dgram');
	var message = new Buffer("PyHB");
	var server_ip = '127.0.0.1';
	var server_port = 43278;
	var beat_period = 1;
	var debug = 1;

	console.log("Sending light instructions to IP " + server_ip + " , port " + server_port);
	console.log("press Ctrl-C to stop");

	var client = dgram.createSocket("udp4");

	client.on("error", function (exception) {
		console.log("Exception: " + exception);
	});

	setInterval(function() {
		var pattern = Display.getNextPattern();
		if (pattern == null) {
			process.exit(0);
		}

		console.dir(pattern);
		//client.send(message, 0, message.length, server_port, server_ip);
	}, Display.getBeatInterval());

});