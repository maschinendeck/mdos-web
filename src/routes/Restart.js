const Response        = require("../Response");
const {Log, LogLevel} = require("../Std");
const User            = require("../Models/User");    

const {Capabilities} = User;

const Restart = serial => {

	return (request, response) => {
		const {user} = request;

		if (!User.Can(Capabilities.RESTART, user.role)) {
			response.json(Response.InsufficientRightsError());
			return;
		}

		serial.reboot();

		Log(`User '${user.email}' requested system restart`, LogLevel.INFO);
		response.json(new Response("/restart"));
	}
}

module.exports = Restart;