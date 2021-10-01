const Mailer = require("../Mailer");

const Response = require("../Response");
const User     = require("../Models/User");

class InvalidEmailError extends Response {
	constructor() {
		super("/password", null, "supplied email is invalid or empty", 303);
	}
}

const Password = async (request, response) => {
	const {email} = request.params;
	const mailer  = new Mailer();

	if (!email || email == "") {
		response.json(InvalidEmailError());
		return;
	}

	const user = await User.findOne({
		where : {
			email
		}
	});

	if (user) {
		const key           = User.GenerateResetKey();
		user.password_reset = key;
		user.save();

		mailer.send(user.email, "MDoS – Passwort zurücksetzen", `
			<p>
				Hi ${user.nickname && user.nickname !== "" ? user.nickname : user.firstname},
			</p>
			<p>
				du erhälst diese E-Mail, weil für deinen Benutzeraccount auf dem MDoS des Maschindendeck Trier e.V. ein
				Passwortreset angefordert wurde.
			</p>
			<p>
				Um dein Passwort zu ändern, folge diesem <a href="https://${process.env.DOMAIN || ""}/newPasswort">Link</a>
			</p>
			<p>
				Falls du diesen Reset nicht angefordert hast, kannst du diese E-Mail einfach ignorieren.
			</p>
		`);
	}

	response.json(new Response("/password"));
}

module.exports = Password;