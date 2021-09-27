import {$}     from "./Q6.js";
import APICall from "./APICall.js";

const Login = (navigator, jwt, setJWT) => {

	const container         = $("#login");
	const usernameContainer = $("#username");
	const passwordContainer = $("#password");
	const button            = $("#loginButton");

	if (jwt) {
		APICall.JWT = jwt;
		navigator.changeView(navigator.views.menu);
	}

	const login = () => {
		const username = usernameContainer.val();
		const password = passwordContainer.val();

		APICall.post("/auth", {
			username,
			password
		}).then(response => {
			if (response.code !== 200) {
				usernameContainer.attr("disabled", "disabled");
				passwordContainer.attr("disabled", "disabled");
				container.addClass("wrong");

				setTimeout(() => {
					usernameContainer.removeAttr("disabled");
					passwordContainer.removeAttr("disabled").get().focus();
					container.removeClass("wrong");
				}, 1000);
				return;
			}
			setJWT(response.data.jwt);
			APICall.JWT = response.data.jwt;
			navigator.changeView(navigator.views.menu);
			passwordContainer.val("");

		}).catch(error => {
			console.log("error", error);
		});
	}

	button.on("click", login);
}

export default Login;