import {$}     from "./Q6.js";
import APICall from "./APICall.js";
import Alert   from "./Alert.js";
class Keypad {
	constructor(navigator) {
		this.navigator = navigator;
		this.keys      = $(".keypad > button");
		this.wrapper   = $(".keypad");
		this.display   = $("#display");
		this.container = $("#view_keypad");

		// touch handlers for keypad
		this.keys.each(key => {
			key.on("click", element => {
				const value = element.html();
				if (value === "C")
					this.clearDisplay();
				else if (value === "OK")
					this.send(element);
				else {
					this.addToDisplay(value);
				}
			})
		});

		this.clearDisplay();

		// handle keyboard input for when on desktop
		$(document).on("keydown", (_, event) => {
			if (!this.container.hasClass("active"))
				return;

			const key = parseInt(event.key);

			// handle backspace and delete key
			if ((event.keyCode === 8 || event.keyCode === 48)) {
				event.preventDefault();
				this.clearDisplay();

				return;
			}

			// handle enter key
			if (event.key === "Enter") {
				this.send();
				
				return;
			}

			// handle number keys
			if (!key || key > 9 || key < 0)
				return;
			this.addToDisplay(key.toString());
		});
	}

	// add char to display by setting the value of the input field
	addToDisplay(char) {
		const currentValue = this.display.attr("value") || "";
		if (isNaN(char) || currentValue.length >= 4)
			return;
		this.display.attr("value", currentValue.toString() + "" + char.toString());
	}

	send(element) {
		const currentValue = element.html();
		element.html("<div class=spinner>O</div>");

		this.wrapper.addClass("idle");
		$("button").attr("disabled", "disabled");
		APICall.post("/door/open", {
			code : this.display.val()
		}).then(response => {
			this.wrapper.removeClass("idle");
			$("button").removeAttr("disabled");
			element.html(currentValue);

			if (response.code && parseInt(response.code) === 401) {
				this.navigator.deauthorize();

				return;
			}

			switch (response.code) {
				case 200:
					new Alert(Alert.Type.Success, "Der Code war korrekt. Die Tür wird geöffnet.");
					this.clearDisplay();
					this.navigator.changeView(this.navigator.views.menu);
					break;
				case 405:
					new Alert(Alert.Type.ERROR, `Dir fehlt die Berechtigung diese Aktion durchzuführen`);
					this.clearDisplay();
					return;
				case 508:
					new Alert(Alert.Type.ERROR, "Der angegebene Code war inkorrekt.");
					this.clearDisplay();
					this.navigator.changeView(this.navigator.views.menu);
					return;
				default:
					new Alert(Alert.Type.ERROR, `Etwas ist schiefgelaufen [Code ${response.code}]`);
					this.clearDisplay();
					return;
			}
		});
	}

	// clear the whole display by clearing the value of the input field
	clearDisplay() {
		this.display.attr("value", "");
	}
}

export default Keypad;