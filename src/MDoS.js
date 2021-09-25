const Express    = require("express");
const BodyParser = require("body-parser");
const JWT        = require("express-jwt");
const {Router}   = Express;

const {ErrorMiddleware} = require("./Response");
const {Log, LogLevel}   = require("./Std");

const Auth    = require("./routes/Auth");
const Door    = require("./routes/Door");
const Restart = require("./routes/Restart");

class MDoS {
	constructor() {
		this.app    = Express();
		this.router = Router();

		this.attachMiddlewares();
		this.attachRoutes();
	}

	attachRoutes() {
		this.router.post("/auth",        Auth);
		this.router.get("/door/:action", Door);
		this.router.get("/restart",      Restart);
	}

	attachMiddlewares() {
		this.app.use(BodyParser.json());
		this.app.use(Express.static(`${__dirname}/../public`));
		this.app.use("/api", this.router);
		this.app.use("/api", JWT({
			secret : process.env.SECRET,
			algorithms : [
				"HS256"
			]
		}).unless({
			path : [
				"/api/auth"
			]
		}));
		this.app.use(ErrorMiddleware);
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