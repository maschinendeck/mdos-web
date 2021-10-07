import {$}     from "./Q6.js";
import APICall from "./APICall.js";
import {Visit} from "./Router.js";
import Alert   from "./Alert.js";

const Login = (router, jwt, setJWT) => {

	const container         = $("#login");
	const usernameContainer = $("#username");
	const passwordContainer = $("#password");
	const logoutButton      = $("#logoutButton");
	const form              = $("#loginForm");

	logoutButton.on("click", () => {
		setJWT(null);
		Visit("login");
	});

	if (jwt) {
		APICall.JWT = jwt;
		if (router.length < 1) {
			Visit("/menu");
			console.log("loggedin", router.path);
		}
	}

	const login = () => {
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
				}, 1000);
				return;
			}
			setJWT(response.data.jwt);
			APICall.JWT = response.data.jwt;
			Visit("/menu");
			passwordContainer.val("");
		}).catch(error => {
			new Alert(Alert.Type.ERROR, "Es besteht ein Problem mit der Kommunikation zum Login-Endpunkt.");
			console.log("error", error);
		});
	}

	form.on("submit", (_, event) => {
		event.preventDefault();
		login(event);
	});
}

export default Login;