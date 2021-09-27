class APICall {
	static async fetch(url = "/", method = "POST", body = {}) {
		const options = {
			method,
			headers : {
				"Content-Type" : "application/json"
			}
		};
		if (method === "POST")
			options.body = JSON.stringify(body);
		if (APICall.JWT)
			options.headers.Authorization = `Bearer ${APICall.JWT}`;
		return fetch(`/api${url}`, options).then(response => response.json()).then(json => {
			if (json.code && parseInt(json.code) === 401) {

			}

			return json;
		});
	}

	static async get(path) {
		return APICall.fetch(path, "GET");
	}

	static async post(path, data) {
		return APICall.fetch(path, "POST", data);
	}
}
APICall.JWT = null;

export default APICall;