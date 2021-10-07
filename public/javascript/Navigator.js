import {$}     from "./Q6.js";
import APICall from "./APICall.js";
import Alert   from "./Alert.js";
import {Visit} from "./Router.js";

class Navigator {
	constructor(jwt, setJWT) {
		this.jwt     = jwt;
		this.setJWT  = setJWT;
		this.buttons = {
			open    : $("#open"),
			close   : $("#close"),
			restart : $("#restart"),
			abort   : $("#abort")
		};
		this.buttons.abort.on("click", () => {
			Visit("/menu");
		});
		this.buttons.open.on("click", () => {
			APICall.get("/door/request").then(response => {
				switch (response.code) {
					case 200:
						break;
					case 401:
						Visit("/login");
						break;
					case 430:
						new Alert(Alert.Type.ERROR, "Timeout während des Vorgangs");
						Visit("/menu");
						break;
					default:
						new Alert(Alert.Type.ERROR, `Fehler beim Anfordern des Türcodes: ${response.message} [${response.code}]`);
						Visit("/menu");
						break;
				}
			});
			Visit("/keypad");
		});

		this.buttons.close.on("click", () => {
			this.closeDoor();
		});

		this.buttons.restart.on("click", () => {
			this.restartSystem();
		});
	}

	closeDoor() {
		APICall.get("/door/close").then(response => {
			switch (response.code) {
				case 200:
					new Alert(Alert.Type.SUCCESS, "Tür wird geschlossen.");
					break;
				case 401:
					this.deauthorize();
					return;
				case 405:
					new Alert(Alert.Type.ERROR, `Dir fehlt die Berechtigung diese Aktion durchzuführen`);
					return;
				default:
					new Alert(Alert.Type.ERROR, `Etwas ist schiefgelaufen [Code ${response.code}]`);
					return;

			}
		});
	}

	restartSystem() {
		APICall.get("/restart").then(response => {
			if (response.code && parseInt(response.code) === 401) {
				this.deauthorize();

				return;
			}

			switch (response.code) {
				case 200:
					new Alert(Alert.Type.SUCCESS, "System wird nun neugestartet.");
					this.deauthorize();
					break;
				case 405:
					new Alert(Alert.Type.ERROR, `Dir fehlt die Berechtigung diese Aktion durchzuführen`);
					return;
				default:
					new Alert(Alert.Type.ERROR, `Etwas ist schiefgelaufen [Code ${response.code}]`);
					return;
			}
		});
	}

	deauthorize() {
		this.setJWT(null);
		APICall.JWT = null;
		Visit("/login");
	}
}

export default Navigator;