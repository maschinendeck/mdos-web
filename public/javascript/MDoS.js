import {$}       from "./Q6.js";
import Navigator from "./Navigator.js";
import Keypad    from "./Keypad.js";
import Login     from "./Login.js";

$(document).ready(() => {
	new Navigator();
	new Login();
	new Keypad();
}).on("touchstart", (_, event) => {
	event.preventDefault();
});