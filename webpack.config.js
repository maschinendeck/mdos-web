const path = require("path");

module.exports = {
	entry: "./public/javascript/MDoS.js",
	output: {
		filename: "mdos.min.js",
		path: path.resolve(__dirname, "public", "javascript"),
 	},
	 mode : "production"
};