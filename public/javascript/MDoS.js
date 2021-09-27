import useLocalStorage from "./hooks/useLocalStorage.js";

import {$}       from "./Q6.js";
import Navigator from "./Navigator.js";
import Keypad    from "./Keypad.js";
import Login     from "./Login.js";

$(document).ready(() => {
	const [jwt, setJWT] = useLocalStorage("jwt", null);

	const navigator = new Navigator(jwt, setJWT);
	Login(navigator, jwt, setJWT);
	new Keypad(navigator);
}).on("touchmove", (_, event) => {
	event.preventDefault();
});