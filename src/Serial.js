const SerialPort = require("serialport");
const ReadLine   = require("@serialport/parser-readline");

const {Log, LogLevel} = require("./Std");

class Serial {
	constructor() {
		const parser = new ReadLine({delimiter : "\r\n"});
		
		this.ready_     = false;
		this.callbacks_ = [];

		this.port = new SerialPort(process.env.SERIALPORT || "", {
			baudRate : parseInt(process.env.BAUDRATE) || 9600
		});
		this.pipe = this.port.pipe(parser);

		this.port.on("open", () => {
			Log("Serial port is open", LogLevel.INFO);
		});
		this.port.on("error", error => {
			Log(`[ERROR] SerialPort: ${error.message.replace("Error: ", "")}`, LogLevel.ERROR);
		});

		this.pipe.on("data", data => {
			console.log(data);
			if (data === "ready") {
				Log("MDoS door unit ready", LogLevel.INFO);
				this.ready_ = true;
				this.write("lol");
			}
			const parts = data.split(' ');
			if (parts.length < 2)
				return;
			const response = {
				code    : parseInt(parts.shift()),
				message : parts.join(' ')
			};
			console.log("READ", response);
			for (const callback of this.callbacks_) {
				callback(response);
			}
		});
	}

	addListener(callback) {
		this.callbacks_.push(callback);
	}

	data(callback) {
		return this.pipe.on("data", data => {
			console.log("SERIALD", data);
			callback(data);
		});
	}

	write(data) {
		return this.port.write(`${data}\n`);
	}
}

module.exports = Serial;