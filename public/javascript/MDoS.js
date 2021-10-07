import useLocalStorage from "./hooks/useLocalStorage.js";

import {$}           from "./Q6.js";
import Router        from "./Router.js";
import Navigator     from "./Navigator.js";
import Keypad        from "./Keypad.js";
import Login         from "./Login.js";
import Password      from "./Password.js";
import PasswordReset from "./PasswordReset.js";

$(document).ready(() => {
	const [jwt, setJWT] = useLocalStorage("jwt", null);

	const router    = new Router();
	const navigator = new Navigator(jwt, setJWT);
	Login(router, jwt, setJWT);
	new Keypad(navigator);
	new Password();
	new PasswordReset();
}).on("touchmove", (_, event) => {
	event.preventDefault();
});