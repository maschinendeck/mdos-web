const Response        = require("../Response");
const {Log, LogLevel} = require("../Std");

const User = require("../Models/User");

class PasswordsDifferError extends Response {
	constructor() {
		super("/password", null, "The supplied passwords are not the same", 310);
	}
}

class InvalidKeyError extends Response {
	constructor() {
		super("/password", null, "This link is not valid", 404);
	}
}

const PasswordReset = async (request, response) => {
	const {key}                       = request.params;
	const {password, passwordConfirm} = request.body;

	if (password !== passwordConfirm) {
		response.json(new PasswordsDifferError());
		return;
	}

	const user = await User.findOne({
		where : {
			password_reset : key
		}
	});

	if (!user) {
		response.json(InvalidKeyError());
		return;
	}

	user.password       = User.HashPassword(password, user.salt);
	user.password_reset = null;
	user.save();
	Log(`Password changed for user '${user.email}'`, LogLevel.INFO);

	response.json(new Response("/password"));
}

module.exports = PasswordReset;