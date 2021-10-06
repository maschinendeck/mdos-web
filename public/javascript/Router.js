import {$} from "./Q6.js";

class Router {
	constructor() {
		this.start = null;
		this.views = {};
		this.path  = Router.Path(window.location.pathname);

		$(".view").each(element => {
			if(element.data("default"))
				this.views.default = element;
			this.views[element.data("view")] = element;
		});

		$("a").each(element => {
			element.click((link, event) => {
				event.preventDefault();
				Router.Visit(link.attr("href"));
			});
		});

		$(window).on("historyChange", (_, event) => {
			this.path = Router.Path(event.newPath);
			this.route();
		});

		this.route();
	}

	route() {
		if (this.path.length < 1) {
			this.changeView(this.views.default);
			return;
		}

		const view = this.path.shift();

		if (Object.keys(this.views).includes(view))
			this.changeView(this.views[view]);
		else
			this.changeView(this.views.notfound);
	}

	changeView(toView) {
		for (const view of Object.values(this.views)) {
			if (view !== toView)
				view.removeClass("active");
		}

		toView.addClass("active");
	}

	static Path(path) {
		return path.split("/").filter(element => element !== "");
	}

	static get Params() {
		return Object.fromEntries(new URLSearchParams(window.location.search).entries());
	}

	static Visit(path) {
		window.history.pushState({}, "", new URL(path, window.location.origin));
		const event   = new Event("historyChange");
		event.newPath = path;
		window.dispatchEvent(event);
	}
}

export const Visit  = Router.Visit;
export const Params = Router.Params
export default Router;