const Response            = require("../Response");
const {Log, LogLevel}     = require("../Std");
const {Can, Capabilities} = require("../Models/User");

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

const Door = (request, response) => {
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
			response.json(new Response("/door/request"));
			break;
		case "open":
			const {code}  = request.body;
			const correct = "core correct";

			if (correct) {
				response.json(new Response("/door"))
			} else {
				response.json(new IncorrectCodeError());
			}

			// request display of access code from MDoS unit	
			Log(`User '${user.email}' requested opening of door`, LogLevel.INFO);
			break;
		case "close":
			// send close command to MDoS unit
			Log(`User '${user.email}' requested closing of door`, LogLevel.INFO);
			break;
		default:
			response.json(new UnknownActionError(action));
			return;
	}
	
	// everything went fine, send ACK
	response.json(new Response("/door"));
}

module.exports = Door;