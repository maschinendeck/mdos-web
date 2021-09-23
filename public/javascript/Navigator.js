import {$} from "./Q6.js";

class Navigator {
	constructor() {
		this.buttons = {
			open    : $("#open"),
			close   : $("#close"),
			restart : $("#restart"),
			abort   : $("#abort")
		};
		this.views = {
			login  : $("#view_login"),
			menu   : $("#view_menu"),
			keypad : $("#view_keypad")
		};

		this.buttons.abort.on("click", event => {
			this.changeView(this.views.menu);
		});
		this.buttons.open.on("click", event => {
			this.changeView(this.views.keypad);
		});

		this.changeView(this.views.menu);
	}

	changeView(toView) {
		for (const view of Object.values(this.views)) {
			if (view !== toView)
				view.removeClass("active");
		}

		toView.addClass("active");
	}
}

export default Navigator;