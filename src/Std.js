const Chalk = require("chalk");

/**
 * Provides a standard library for often used functions
 *
 * @STATIC
 * @author Michael Ochmann <michael.ochmann@propeller.de>
 */
class Std {
	static IsDevelopment() {
		const mode = process.env.NODE_ENV || "development";
		return mode === "development";
	}

	static LogDirect(message, level = Std.LogLevel.NORMAL) {
		if (!Std.IsDevelopment && ![
			Std.LogLevel.ERROR,
			Std.LogLevel.PANIC,
			Std.LogLevel.SUCCESS
		].includes(level)) {
			return;
		}
		let date   = new Date();
		let render = null;

		switch (level) {
			case Std.LogLevel.ERROR:
			case Std.LogLevel.PANIC:
				render = Chalk.red;
				break;
			case Std.LogLevel.INFO:
				render = Chalk.blue;
				break;
			case Std.LogLevel.SUCCESS:
				render = Chalk.green;
				break;
			case Std.LogLevel.WARN:
				render = Chalk.yellow;
				break;
			case Std.LogLevel.NORMAL:
			default:
				render = function (message) {
					return message;
				};
				break;
		}
		console.log(render(`${date.toDateString()} ${date.toLocaleTimeString()}\t${message}`));

		if (level === Std.LogLevel.PANIC)
			process.exit(1);
	}

	static Log(message, level) {
		Std.LogDirect(message, level);
	}

	static Rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static UcFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/*
	 * this magic is nessecary, because reflcetion of `callee.caller` is not availbale in strict mode
	 */
	static GetCaller(offset = 0) {
		try {
			throw new Error();
		} catch (error) {
			var callerName = error.stack.replace(/^Error\s+/, '');
			callerName = callerName.split("\n")[offset + 1];

			return callerName.replace(/ \(.+\)$/, '').replace(/(at|new) /gi, "").replace(".<anonymous>", "").trim();
		}
	}

	static StripHTML(html) {
		return html.replace(/(&lt;([^>]+)>)/gi, "");
	}

	static Sleep(ms) {
		return new Promise(resolve => {
		  setTimeout(resolve, ms);
		});
	}
}
Std.LogLevel = Object.freeze({
	NORMAL  : 1,
	INFO    : 2,
	ERROR   : 3,
	SUCCESS : 4,
	WARN    : 5,
	PANIC   : 6
});
Std.Time = Object.freeze({
	SECONDS : 1000,
	MINUTES : 60 * 1000,
	HOURS   : 60 * 60 * 1000,
	DAYS    : 24 * 60 * 60 * 1000
});

module.exports = Std;