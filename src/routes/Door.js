const Response            = require("../Response");
const {Log, LogLevel}     = require("../Std");
const {Can, Capabilities} = require("../Models/User");

const {InsufficientRightsError} = Response;

class UnknownActionError extends Response {
	constructor(action) {
		super("/door", null, `The requested action '${action}' is not a valid identifier. Use one of 'open', 'close'`, 505);
	}
}

const Door = (request, response) => {
	const {action} = request.params;
	const user     = request.user;

	if (!Can(Capabilities.OPEN_DOOR, user.role))
		response.json(InsufficientRightsError("/door"));

	switch(action) {
		case "open":
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