import {$}     from "./Q6.js";
import APICall from "./APICall.js";
import Alert   from "./Alert.js";

class Password {
	constructor() {
		this.input  = $("#fgEmail");
		this.form   = $("#forgotPasswordForm");
		this.button = $("#fgSendButton");

		this.form.on("submit", (_, event) => this.send(event));
	}

	send(event) {
		if (event)
			event.preventDefault();

		const email = this.input.val();

		if (!email || email === "")
			return;

		APICall.get(`/password/${email}`).then(response => {
			if (response.code === 200) {
				new Alert(Alert.Type.SUCCESS, `
					Wenn die von dir angegebene E-Mail-Adresse im System existiert, haben wir dir eine E-Mail
					mit den Instruktionen zum Zurücksetzen deines Passworts gesendet.
				`);
				this.input.val("");
			}
		}).catch(error => {
			new Alert(Alert.Type.ERROR, `Es ist ein Fehler aufgetreten: ${error.message}`);
			console.log(error);
		});
		
	}
}

export default Password;