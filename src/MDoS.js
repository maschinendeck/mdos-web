const Express    = require("express");
const BodyParser = require("body-parser");
const JWT        = require("express-jwt");
const {Router}   = Express;

const Secret            = require("./Models/Secret");
const {ErrorMiddleware} = require("./Response");
const {Log, LogLevel}   = require("./Std");
const Serial            = require("./Serial");

const Auth    = require("./routes/Auth");
const Door    = require("./routes/Door");
const Restart = require("./routes/Restart");

class MDoS {
	constructor() {
		this.app     = Express();
		this.router  = Router();
		this.serial  = new Serial();

		this.attachMiddlewares();
		this.attachRoutes();
	}

	attachRoutes() {
		const doorHandler = Door(this.serial);
		this.router.post("/auth",        Auth);
		this.router.all("/door/:action", doorHandler);
		//this.router.get("/door/:action",  doorHandler);
		this.router.get("/restart",       Restart(this.serial));
	}

	attachMiddlewares() {
		this.app.use(BodyParser.json());
		this.app.use(Express.static(`${__dirname}/../public`));
		this.app.use("/api", JWT({
			secret : Secret, // invalidates tokens on server restart
			algorithms : [
				"HS256"
			]
		}).unless({
			path : [
				"/api/auth"
			]
		}));
		this.app.use("/api", this.router);
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