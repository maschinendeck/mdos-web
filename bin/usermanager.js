const {Op}     = require("sequelize");
const inquirer = require("inquirer");
const crypto   = require("crypto");

const {Log, LogLevel}            = require("../src/Std");
const User                       = require("../src/Models/User");
const { listenerCount } = require("process");

const mainREPL = async () => {
	return await inquirer.prompt([
		{
			type    : "list",
			name    : "action",
			message : "Which action do you like to perform? (CRUD)",
			choices : [
				"create",
				"read",
				"update",
				"delete",
				"quit"
			]
		}
	]).then(async answers => {
		const {action} = answers;
		
		switch (action) {
			case "quit":
				process.exit();
			case "create":
				createUser();
				break;
			case "read":
				readUser();
				break;
			case "update":
				updateUser();
				break;
			case "delete":
				deleteUser();
				break;
			default:
				mainREPL();
				break;
		}
	});
};

const findAndSelectUser = async (question = "Which user should be selected?") => {
	const {searchString} = await inquirer.prompt([
		{
			type : "input",
			name : "searchString",
			message : "Search user by firstname, lastname, nick or email:"
		}
	]);
	
	let users = await User.findAll({
			where : {
				[Op.or] : {
					email : {
						[Op.like] : `%${searchString}%`
					},
					nickname : {
						[Op.like] : `%${searchString}%`
					},
					firstname : {
						[Op.like] : `%${searchString}%`
					},
					lastname : {
						[Op.like] : `%${searchString}%`
					}
				}
			}
	});
	users = users.map(user => {
		return {
			name  : `[${user.id}] ${user.firstname} ${user.lastname} (${user.email})`,
			value : user.id
		}
	});
	const {userId} = await inquirer.prompt([
		{
			type    : "list",
			name    : "userId",
			message : question,
			choices : [
				...users,
				{
					name : "back"
				}
			]
		}
	]);

	return userId;
}

const readUser = async () => {
	const userId = await findAndSelectUser();

	if (userId === "back") {
		mainREPL();
		return;
	}

	const result = await User.findAll({
		where : {
			id : userId
		}
	});
	const user = result[0];

	console.table(user?.dataValues);

	mainREPL();
}

const updateUser = async () => {
	const userId = await findAndSelectUser();

	if (userId === "back") {
		mainREPL();
		return;
	}

	const result = await User.findAll({
		where : {
			id : userId
		}
	});
	const user = result[0];

	const options = [];

	for (const [key, value] of Object.entries(user.dataValues)) {
		if (["createdAt", "updatedAt", "salt", "id"].includes(key))
			continue;

		if (key === "role") {
			options.push({
				...roleList,
				default : value 
			});
			continue;
		}
		options.push({
			type    : key === "password" ? "password" : "input",
			name    : key,
			message : key,
			default : key === "password" ? null : value
		});
	}

	inquirer.prompt(options).then(answers => {
		for (const [key, value] of Object.entries(answers)) {
			if (key === "password") {
				if (!value)
					continue;
				user.password = User.HashPassword(value, user.salt);				
				continue;
			}

			user[key] = value;
		}
		user.save();
		console.log(answers);
	});
}

const deleteUser = async () => {
	const userId = await findAndSelectUser();

	if (userId === "back") {
		mainREPL();
		return;
	}

	inquirer.prompt([
		{
			type    : "confirm",
			name    : "shure",
			message : `Do you really want to delete user with id '${userId}'`
		}
	]).then(({shure}) => {
		if (shure) {
			User.destroy({
				where : {
					id : userId
				}
			});
			Log(`User with id '${userId}' has been deleted`, LogLevel.SUCCESS);
		} else
			Log("Abort user deletion", LogLevel.WARN);
		mainREPL();
	});
};

const createUser = () => {
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
			roleList
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
		mainREPL();
	}).catch(error =>  {
		console.log(error);
		mainREPL();
	});
};

const roleList = {
	type    : "list",
	name    : "role",
	choices : [
		"guest",
		"member",
		"admin"
	]
}

mainREPL();