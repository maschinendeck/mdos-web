import {$}       from "./Q6.js";
import Navigator from "./Navigator.js";
import Keypad    from "./Keypad.js";

$(document).ready(() => {
	new Navigator();
	new Keypad();
}).on("touchstart", (_, event) => {
	event.preventDefault();
});