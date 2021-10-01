import {$}     from "./Q6.js";
import APICall from "./APICall.js";

const Login = (navigator, jwt, setJWT) => {

	const container         = $("#login");
	const usernameContainer = $("#username");
	const passwordContainer = $("#password");
	const form              = $("#loginForm");
	const button            = $("#loginButton");

	let loggingIn = false;

	if (jwt) {
		APICall.JWT = jwt;
		navigator.changeView(navigator.views.menu);
	}

	const login = () => {
		if (loggingIn)
			return;
		loggingIn      = true;
		const username = usernameContainer.val();
		const password = passwordContainer.val();

		APICall.post("/auth", {
			username,
			password
		}).then(response => {
			if (response?.code !== 200) {
				usernameContainer.attr("disabled", "disabled");
				passwordContainer.attr("disabled", "disabled");
				container.addClass("wrong");

				setTimeout(() => {
					usernameContainer.removeAttr("disabled");
					passwordContainer.removeAttr("disabled").get().focus();
					container.removeClass("wrong");
					loggingIn = false;
				}, 1000);
				return;
			}
			setJWT(response.data.jwt);
			APICall.JWT = response.data.jwt;
			navigator.changeView(navigator.views.menu);
			passwordContainer.val("");
			loggingIn = false;
		}).catch(error => {
			console.log("error", error);
			loggingIn = false;
		});
	}

	form.on("submit", (_, event) => {
		event.preventDefault();
		login(event);
	});
}

export default Login;