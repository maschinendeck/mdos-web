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
				if (response.message !== "waiting") {
					state = Door.State.SUCCESS;
					Log("door success");
				} else 
					state = Door.State.REQUESTED;
				break;
			case 400:
				state = Door.State.WRONG_CODE;
				Log("door wrong code");
				break;
			case 408:
				state = Door.State.TIMEOUT;
				Log("door timeout");
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
				Log("STATE " + state);
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
				Log("STATE " + state + ", CODE " + code);

				serial.write(`code ${code}`);

				while (state === Door.State.REQUESTED) {
					await Sleep(100);
				}
				correct = state === Door.State.SUCCESS;

				if (correct) {
					response.json(new Response("/door"))
				} else {
					response.json(new IncorrectCodeError());
				}
				Log(`User '${user.email}' requested opening of door`, LogLevel.INFO);
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