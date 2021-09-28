import {$}     from "./Q6.js";
import APICall from "./APICall.js";
import Alert   from "./Alert.js";

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
		this.views = {
			login  : $("#view_login"),
			menu   : $("#view_menu"),
			keypad : $("#view_keypad")
		};

		this.buttons.abort.on("click", event => {
			this.changeView(this.views.menu);
		});
		this.buttons.open.on("click", event => {
			APICall.get("/door/request").then(response => {
				switch (response.code) {
					case 200:
						this.changeView(this.views.keypad);
						break;
					default:
						new Alert(`Fehler beim Anfordern des Türcodes: ${response.data}`);
						break;
				}
			});
		});

		this.changeView(this.views.login);

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

	changeView(toView) {
		for (const view of Object.values(this.views)) {
			if (view !== toView)
				view.removeClass("active");
		}

		toView.addClass("active");
	}

	deauthorize() {
		this.setJWT(null);
		APICall.JWT = null;
		this.changeView(this.views.login);
	}
}

export default Navigator;