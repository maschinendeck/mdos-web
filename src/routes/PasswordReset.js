const Response = require("../Response");

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
	const {key}                            = request.params;
	const {password, passwordConfirmation} = request.body;

	if (password !== passwordConfirmation) {
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

	response.json(new Response("/password"));
}

module.exports = PasswordReset;