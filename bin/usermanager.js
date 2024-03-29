require("dotenv").config();

const {Op}       = require("sequelize");
const inquirer   = require("inquirer");
const {DateTime} = require("luxon");

const {Log, LogLevel} = require("../src/Std");
const User            = require("../src/Models/User");
const Mailer          = require("../src/Mailer");

const mailer = new Mailer();

const formatDate = sqliteString => {
	return DateTime.fromJSDate(sqliteString).toFormat("dd.LL.yyyy hh:mm");
};

const mainREPL = async () => {
	return await inquirer.prompt([
		{
			type    : "list",
			name    : "action",
			message : "Which action do you like to perform? (CRUD)",
			choices : [
				"list",
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
			case "list":
				listUsers();
				break;
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

const listUsers = async () => {
	const users     = await User.findAll();
	const maxLength = 13;

	console.table(users.map(user => {
		const data = user.dataValues;

		// shortening strings
		for (const [key, value] of Object.entries(data))
			data[key] = value?.length > maxLength ? value.substr(0, maxLength - 1) + "..." : value;
		data.updatedAt = formatDate(data.updatedAt);
		data.createdAt = formatDate(data.createdAt);
		delete data.password;
		delete data.salt;
		
		return data;
	}).reduce((accumulator, element) => {const id = element.id; delete element.id; accumulator[id] = element; return accumulator}, {}));

	mainREPL();
}

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
	const id = await findAndSelectUser();

	if (id === "back") {
		mainREPL();
		return;
	}

	const user = await User.findOne({
		where : {
			id
		}
	});
	
	console.table(user?.dataValues);

	mainREPL();
}

const updateUser = async () => {
	const userId = await findAndSelectUser();

	if (userId === "back") {
		mainREPL();
		return;
	}

	const user = await User.findOne({
		where : {
			id : userId
		}
	});

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
			if (key === "email")
				user[key] = value.toLowerCase();
			else
				user[key] = value;
		}
		user.save();
		console.log(answers);
		mainREPL();
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
		let initialPassword = password;

		if (!password || password === "") {
			initialPassword = User.GeneratePassword();

			mailer.send(email, "MDoS – Ein Account wurde für dich erstellt!", `
				<p>
					Im Maschindendeck Trier e.V. Türsystem unter
					<a href="https://${process.env.DOMAIN}">https://${process.env.DOMAIN}</a>
					wurde ein Account für dich erstellt!
				</p>
				<br />
				<pre>
Benutzername: ${email}
Passwort    : ${initialPassword}
				</pre>
			`);
			Log("Sent email with initial password to user", LogLevel.SUCCESS);
		}

		const salt            = User.GenerateSalt();
		const newUser         = User.build({
			firstname,
			lastname,
			email     : email.toLowerCase(),
			nickname,
			salt      : salt,
			password  : User.HashPassword(initialPassword, salt),
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