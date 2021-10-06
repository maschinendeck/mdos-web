const JWT = require("jsonwebtoken");

const Secret                = require("../Models/Secret");
const {Time, Log, LogLevel} = require("../Std");

const User     = require("../Models/User");
const Response = require("../Response");

class AuthenticationError extends Response {
	constructor() {
		super("/auth", null, "Incorrect credentials supplied", 403);
	}
}

const Auth = async (request, response) => {
	const {username, password} = request.body;
	const email = username.toLowerCase();

	if (!username || !password) {
		response.json(new AuthenticationError());
		return;
	}

	const users = await User.findAll({
		where : {
			email
		}
	});

	if (users.length !== 1) {
		Log(`Unknown user '${username}' has tried to log in`, LogLevel.ERROR);
		response.json(new AuthenticationError());
		return;
	}

	const user           = users[0];
	const hashedPassword = User.HashPassword(password, user.salt);

	if (hashedPassword !== user.password) {
		Log(`User '${user.email}' supplied wrong credentials`, LogLevel.ERROR);
		response.json(new AuthenticationError());
		return;
	}

	const hours = Time.HOURS * (process.env.TOKEN_HOURS || 12);
	const jwt   = await JWT.sign({
		email    : user.email,
		nickname : user.nickname,
		role     : user.role
	}, Secret, {
		expiresIn : (Time.HOURS * hours) / 1000
	});

	Log(`User '${user.email}' authenticated successfully. Issued JWT`, LogLevel.INFO);
	response.json(new Response("/auth", {
		jwt
	}));
}

module.exports = Auth;