class Response {
	constructor(path, data = null, message = "OK", code = 200) {
		this.message = message
		this.code    = code
		this.path    = path;
		if (data)
			this.data = data;
	}

	static InsufficientRightsError(path) {
		return new Response(path, null, "Your rights are not sufficient to perform this action", 405);
	}

	static ErrorMiddleware(error, request, response, next) {
		if (!error)
			next();
		let message;
		let code;

		switch (error.code) {
			case "invalid_token":
				code    = 401;
				message = "Authentication token invalid or missing";
				break;
			case "credentials_required":
				code    = 403;
				message = "Credentials are required";
				break;
			default:
				code    = error.code;
				message = error.message;
				break;
		}
		
		response.status(code).send(JSON.stringify(new Response(request.path, null, message, code)));
	}
}

module.exports = Response;