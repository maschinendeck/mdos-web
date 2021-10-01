require("dotenv").config();

const MDoS = require("./src/MDoS");

if (!process.env.hasOwnProperty("SECRET"))
	Log(`No SECRET supplied in .env file: ${process.env.SECRET}`, LogLevel.PANIC);	

const APP = new MDoS();
APP.listen();