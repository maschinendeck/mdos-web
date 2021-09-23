import {$} from "./Q6.js";

class Keypad {
	constructor() {
		this.keys = $(".keypad > button");
		this.display = $("#display");

		// touch handlers for keypad
		this.keys.each(key => {
			key.on("click", element => {
				const value = element.html();
				if (value === "C")
					this.clearDisplay();
				else if (value === "OK")
					this.send();
				else {
					this.addToDisplay(value);
				}
			})
		});

		// handle keyboard input for when on desktop
		$(document).on("keydown", (_, event) => {
			const key = parseInt(event.key);

			// handle backspace and delete key
			if (event.keyCode === 8 || event.keyCode === 48) {
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
		if (currentValue.length >= 4)
			return;
		this.display.attr("value", currentValue + char.toString());
	}

	send() {
		fetch("./auth")
			.then(response => response.json())
			.then(json => console.log(json))
			.catch(error => console.log(error));
	}

	// clear the whole display by clearing the value of the input field
	clearDisplay() {
		this.display.attr("value", "");
	}
}

export default Keypad;