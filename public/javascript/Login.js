import {$}     from "./Q6.js";
import APICall from "./APICall.js";

class Login {
	constructor() {
		this.container = $("#login");
		this.username  = $("#username");
		this.password  = $("#password");
		this.button    = $("#loginButton");
	
		this.button.on("click", () => this.login());
	}

	login() {
		const username = this.username.val();
		const password = this.password.val();

		APICall.post("/auth", {
			username,
			password
		}).then(response => response.json()).then(json => {
			if (json.code !== 200) {
				this.username.attr("disabled", "disabled");
				this.password.attr("disabled", "disabled");

				console.log("error: ", json.message);
				this.container.addClass("wrong");

				setTimeout(() => {
					this.username.removeAttr("disabled");
					this.password.removeAttr("disabled").get().focus();
					this.container.removeClass("wrong");
				}, 1000);
				return;
			}
			APICall.JWT = json.data.jwt;
		}).catch(error => {
			console.log("error", error);
		});
	}
}

export default Login;