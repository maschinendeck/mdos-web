const {Op}     = require("sequelize");
const inquirer = require("inquirer");
const crypto   = require("crypto");

const {Log, LogLevel}            = require("../src/Std");
const User                       = require("../src/Models/User");

const userAttributes = [
	"firstname",
	"lastname",
	"nickname",
	"email",
].map(attribute => {
	return {
		type   : "input",
		name   : attribute,
	}
});

inquirer.prompt([
		...userAttributes,
		{
			type    : "password",
			name    : "password",
			message : "password (leave empty for generating one automatically)"
		},
		{
			type    : "list",
			name    : "role",
			choices : [
				"guest",
				"member",
				"admin"
			]
		}
	]).then(async answers => {
	const {firstname, lastname, nickname, email, role, password} = answers;
	const exists = await User.count({
		where : {
			email : {
				[Op.eq] : email
			}
		}
	});
	if (exists > 0) {
		Log(`User with email '${email}' already exists`, LogLevel.ERROR);
		process.exit();
	}
	const capabilities    = role;
	const initialPassword = password && password !== "" ? password : User.GeneratePassword();
	const salt            = User.GenerateSalt();
	const newUser         = User.build({
		firstname,
		lastname,
		email,
		nickname,
		salt     : salt,
		password : User.HashPassword(initialPassword, salt),
		role
	});
	
	try {
		await newUser.validate();
		newUser.save();
		Log(`User '${email}' (firstname: ${firstname}, lastname: ${lastname}, role: ${role}) has been created successfully.`, LogLevel.SUCCESS);
	} catch (exception) {
		if (!exception.errors) {
			console.log(exception.message);
			process.exit();
		}
		Log("ERROR: could not save user:");
		for (const error of exception.errors)
			Log(`\t${error.message}`, LogLevel.ERROR);
	}

}).catch(error => console.log(error));