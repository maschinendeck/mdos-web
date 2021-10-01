const Response               = require("../Response");
const {Log, LogLevel, Sleep} = require("../Std");
const {Can, Capabilities}    = require("../Models/User");

const {InsufficientRightsError} = Response;

class UnknownActionError extends Response {
	constructor(action) {
		super("/door", null, `The requested action '${action}' is not a valid identifier. Use one of 'open', 'close'`, 505);
	}
}

class IncorrectCodeError extends Response {
	constructor() {
		super("/door", null, "According to MDoS, the supplied code was incorrect", 508);
	}
}

class CodeTimeoutError extends Response {
	constructor() {
		super("/door", null, "Timeout for code request", 430);
	}
}

class InvalidMDoSStateError extends Response {
	constructor() {
		super("/door", null, "MDoS is in an invalid state", 508);
	}
}

const Door = serial => {
	return async (request, response) => {
		const {action} = request.params;
		const user     = request.user;

		if (!user) {
			response.json(Response.AuthenticationError("/door"));
			return;
		}

		if (!Can(Capabilities.OPEN_DOOR, user.role)) {
			response.json(InsufficientRightsError("/door"));

			return;
		}

		switch(action) {
			case "request":
				// tell system to show code
				Log(`User '${user.email}' requested opening of door`, LogLevel.INFO);

				Log("Send 'open' request to MDoS", LogLevel.INFO);
				serial.write("open");

				let loop  = true;
				let error = null;

				// prevent endless loop
				const deadManSwitch = setTimeout(() => {
					loop  = false;
				}, 20000);

				const listener = serial.addListener(response => {
					if (response.code === 200 && response.message === "waiting")
						return;
					if (response.code === 408)
						error = 1;
					clearTimeout(deadManSwitch);
					loop = false;
				});

				while (loop)
					await Sleep(100);
				
				serial.removeListener(listener);

				if (error) {
					response.json(new CodeTimeoutError());
					Log("Open request timed out", LogLevel.INFO);
				}
				else
					response.json(new Response("/door"));
				
				return;
			case "open": {
				const {code}  = request.body;
				Log(`Sent code to MDoS for validation`, LogLevel.INFO);

				serial.write(`code ${code}`);

				let loop    = true;
				let error   = null;
				let correct = false;

				// prevent endless loop
				const deadManSwitch = setTimeout(() => {
					loop  = false;
					error = 1;
				}, 20000);

				const listener = serial.addListener(response => {
					switch(response.code) {
						case 200:
							if (response.message === "waiting")
								return;
							correct = true;
							Log(`User '${user.email}' submitted correct code '${code}'`, LogLevel.INFO);
							Log("Opening door now", LogLevel.WARN);
							break;
						case 400:
							error = 400;
							Log(`User '${user.email}' submitted incorrect code '${code}'`, LogLevel.INFO);
							break;
						default:
							error = 1;
							break;
						
					}
					clearTimeout(deadManSwitch);
					loop = false;
				});

				while (loop)
					await Sleep(100);
				
				serial.removeListener(listener);

				if (!error && correct)
					response.json(new Response("/door"));
				else if (error === 400)
					response.json(new IncorrectCodeError());
				else
					response.json(new InvalidMDoSStateError());

				return;
			}
			case "close":
				serial.write("close");
				Log(`User '${user.email}' requested closing of door`, LogLevel.INFO);
				response.json(new Response("/door"));
				return;
			default:
				Log(`Received unknow action '${action}'`, LogLevel.WARN);
				response.json(new UnknownActionError(action));
				return;
		}
	}
};
Door.State = Object.freeze({
	IDLE       : 1,
	REQUESTED  : 2,
	TIMEOUT    : 3,
	WRONG_CODE : 4,
	SUCCESS    : 5
});

module.exports = Door;