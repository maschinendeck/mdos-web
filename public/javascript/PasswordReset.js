import {$}             from "./Q6.js";
import APICall         from "./APICall.js";
import Alert           from "./Alert.js";
import {Params, Visit} from "./Router.js";

class PasswordReset {
	constructor() {
		this.input        = $("#chPassword");
		this.inputConfirm = $("#chPasswordConfirm");
		this.form         = $("#changePasswordForm");
		this.button       = $("#chSendButton");
	
		const {key} = Params;
		this.key    = typeof key === "undefined" ? null : key;

		this.form.on("submit", (_, event) => this.send(event));
	}

	send(event) {
		event.preventDefault();

		const password        = this.input.val();
		const passwordConfirm = this.inputConfirm.val();

		if (!this.key) {
			new Alert(Alert.Type.ERROR, "Kein Reset-Key übermittelt.");
			return;
		}

		if (password.length < 8 || passwordConfirm.length < 8) {
			new Alert(Alert.Type.ERROR, "Das Passwort muss mindestens 8 Zeichen lang sein.");
			return;
		}

		if (password !== passwordConfirm) {
			new Alert(Alert.Type.ERROR, "Die Passwörter sind nicht identisch.");
			return;
		}

		APICall.post(`/password/${this.key}`, {
			password,
			passwordConfirm
		}).then(response => {
			if (response.code === 200) {
				new Alert(Alert.Type.SUCCESS, "Dein Passwort wurde erfolgreich geändert.");
				Visit("/login");
			} else
				new Alert(Alert.Type.ERROR, `Fehler beim Ändern des Passworts: ${response.message}`);
		}).catch(error => {
			new Alert(Alert.Type.ERROR, `Fehler beim Ändern des Passworts: ${error.message}`);
		});

	}
}

export default PasswordReset;