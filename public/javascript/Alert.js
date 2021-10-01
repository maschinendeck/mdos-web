import {$} from "./Q6.js";

class Alert {
	constructor(type = Alert.Type.SUCCESS, message, options = {}) {
		options = {
			showFor     : 5000,
			dismissable : false,
			...options	
		};

		const alert = $(`
			<div class="alert ${type}">
				${message}
			</div>
		`);

		Alert.Container.append(alert);

		setTimeout(() => {
			alert.addClass("remove");
			setTimeout(() => {
				alert.remove();
			}, 400);
		}, options.showFor);
	}
}
Alert.Container = $("#alerts");
Alert.Type      = Object.freeze({
	SUCCESS : "success",
	ERROR   : "error"
});

export default Alert;