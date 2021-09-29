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

const Door = serial => {
	let state = Door.State.IDLE;

	serial.addListener(response => {
		switch(response.code) {
			case 200:
				switch (response.message) {
					case "waiting":
						state = Door.State.SUCCESS;
						break;
					default:
						state = Door.State.REQUESTED;
						break;
				}
				break;
			case 400:
				state = Door.State.WRONG_CODE;
				break;
			case 408:
				state = Door.State.TIMEOUT;
				break;
			default:
				break;
		}
	});

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
				serial.write("open");
				while (state === Door.State.IDLE)
					await Sleep(100);
				if (state === Door.State.REQUESTED)
					response.json(new Response("/door/request"));
				else
					response.json(new Response("/door/request", null, "timeout", 430));
				return;
			case "open":
				const {code}  = request.body;
				let correct   = false;
				Log(`Checking code`, LogLevel.INFO);

				serial.write(`code ${code}`);

				while (state === Door.State.REQUESTED)
					await Sleep(100);
				correct = state === Door.State.SUCCESS;

				if (correct) {
					response.json(new Response("/door"))
					Log(`User '${user.email}' submitted correct code '${code}'`, LogLevel.SUCCESS);
				} else {
					Log(`User '${user.email}' submitted wrong code '${code}'`, LogLevel.ERROR);
					response.json(new IncorrectCodeError());
				}
				return;
			case "close":
				serial.write("close");
				Log(`User '${user.email}' requested closing of door`, LogLevel.INFO);
				break;
			default:
				console.log(`Unknow action ::${action}::`);
				response.json(new UnknownActionError(action));
				return;
		}
		
		// everything went fine, send ACK
		//response.json(new Response("/door"));
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