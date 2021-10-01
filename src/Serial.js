const SerialPort = require("serialport");
const ReadLine   = require("@serialport/parser-readline");

const {Log, LogLevel, IsDevelopment} = require("./Std");

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
			this.write("reboot");
		});
		this.port.on("error", error => {
			Log(`[ERROR] SerialPort: ${error.message.replace("Error: ", "")}`, LogLevel.ERROR);
		});

		this.pipe.on("data", data => {
			if (IsDevelopment())
				console.log("[DEBUG] Serial " + data);
			if (data === "ready") {
				Log("MDoS door unit ready", LogLevel.INFO);
				this.ready_ = true;
			}
			const parts = data.split(' ');
			if (parts.length < 2)
				return;
			const response = {
				code    : parseInt(parts.shift()),
				message : parts.join(' ')
			};
			for (const callback of this.callbacks_) {
				callback(response);
			}
		});
	}

	reboot() {
		this.ready_ = false;
		this.write("reboot");
	}

	ready() {
		return this.ready_;
	}

	addListener(callback) {
		this.callbacks_.push(callback);

		return this.callbacks_.length - 1;
	}

	removeListener(id) {
		this.callbacks_ = this.callbacks_.slice(id, 1);
	}

	data(callback) {
		return this.pipe.on("data", data => {
			callback(data);
		});
	}

	write(data) {
		return this.port.write(`${data}\n`);
	}
}

module.exports = Serial;