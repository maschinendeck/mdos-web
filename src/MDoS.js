const Express    = require("express");
const BodyParser = require("body-parser");
const JWT        = require("express-jwt");

const {ErrorMiddleware} = require("./Response");
const {Log, LogLevel}   = require("./Std");

const Auth    = require("./routes/Auth");
const Door    = require("./routes/Door");
const Restart = require("./routes/Restart");

class MDoS {
	constructor() {
		this.app = Express();

		this.attachMiddlewares();
		this.attachRoutes();
	}

	attachRoutes() {
		this.app.post("/auth",        Auth);
		this.app.get("/door/:action", Door);
		this.app.get("/restart",      Restart);
	}

	attachMiddlewares() {
		this.app.use(Express.static(`${__dirname}/../public`));
		this.app.use(JWT({
			secret : process.env.SECRET,
			algorithms : [
				"HS256"
			]
		}).unless({
			path : [
				"/auth"
			]
		}));
		this.app.use(ErrorMiddleware);
		this.app.use(BodyParser.json());
	}

	listen() {
		const port = process.env.PORT || 9000;
		this.app.listen(port).on("error", error => {
			switch(error.code) {
				case "EADDRINUSE":
					Log(`The selected port '${port}' is already in use`, LogLevel.PANIC);
					break;
				default:
					Log(`ERROR: ${error.message}`, LogLevel.PANIC);
					break;
			}
		}).on("listening", () => Log(`MDoS server started`, LogLevel.SUCCESS));
	}
}

module.exports = MDoS;