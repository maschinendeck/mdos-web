const NodeMailer = require("nodemailer");
const fs         = require("fs");
const path       = require("path");

const Logo                       = Buffer.from(fs.readFileSync(path.join(__dirname, "..", "public", "assets", "logo_maschinendeck.svg")), "utf8");
const {Log, LogLevel, StripHTML} = require("./Std");

class Mailer {
	constructor() {
		const mailOptions = {
			port : process.env.MAIL_PORT || 587,
			host : process.env.MAIL_SERVER || "maschinendeck.org",
			auth : {
				user : process.env.MAIL_USER || "noreply@tuer.maschinendeck.org",
				pass : process.env.MAIL_PASSWORD
			},
		};
		this.socket = NodeMailer.createTransport(mailOptions);
		this.socket.verify((error, success) => {
			if (error)
				Log(`ERROR Mailer: ${error}`, LogLevel.ERROR);
			else if (success)
				Log("Mailer connected", LogLevel.SUCCESS);
		});
	}

	send(to, subject, message) {
		const content = Mailer.Template(message);
		this.socket.sendMail({
			from : `Maschinendeck MDoS <${process.env.MAIL_USER}>`,
			to,
			subject,
			text : StripHTML(content),
			html : content,
		}, error => {
			if (error)
				Log(`Could not send mail to '${to}': ${error}`, LogLevel.ERROR);
		});
	}
}
Mailer.Template = message => {
	return `
<!DOCTYPE html>
<html>
<head>
	<title>E-Mail</title>
	<style type="text/css">
		html, body {
			background: #222;
			color: white;
			font-family: sans-serif;
		}

		.stripe {
			margin: 2rem 0;
			height: 3rem;
			background: linear-gradient(#ea272e 0, #ea272e 10%, transparent 10%, transparent 20%, #ef6846 20%, #ef6846 30%, transparent 30%, transparent 40%, #fdcf18 40%, #fdcf18 50%, transparent 50%, transparent 60%, #50ba49 60%, #50ba49 70%, transparent 70%, transparent 80%, #00a7ee 80%, #00a7ee 90%, transparent 90%);
		}

		img {
			width: 80px;
			height: auto;
		}
	</style>
</head>
<body>

<div style="padding: 1rem; background: #222; color: white;">
	<div style="padding: 1rem; text-align: center;">
		<div class="logo">
			<img src="data:image/svg+xml;base64,${Logo.toString("base64")}" alt="Logo Maschinendeck Trier e.V." />
		</div>
		<div class="stripe"> </div>
		<p>
			<h2 style="padding: 2rem 0;">Maschinendeck Trier e.V. – MDoS Türsystem</h2>
		</p>
	</div>
	<div style="padding: 4rem 0;">
		${message}
	</div>
</div>

</body>
</html>
	`;
};

module.exports = Mailer;