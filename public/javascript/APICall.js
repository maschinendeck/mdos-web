class APICall {
	static async fetch(url = "/", method = "POST", body = {}) {
		const options = {
			method,
			headers : {
				"Content-Type" : "application/json"
			},
			body : JSON.stringify(body)
		};
		if (APICall.JWT)
			options.headers.Bearer = APICall.JWT;
		return fetch(`/api${url}`, options);
	}

	static async get(path) {
		return APICall.fetch(url, "GET");
	}

	static async post(path, data) {
		return APICall.fetch(path, "POST", data);
	}
}
APICall.JWT = null;

export default APICall;