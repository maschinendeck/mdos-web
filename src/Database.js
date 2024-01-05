const Sequelize = require("sequelize");

class Database {
	constructor() {
		this.connection = new Sequelize({
			dialect : "sqlite",
			charset : "utf8",
			storage : `${__dirname}/../database.sqlite`,
			logging : false
		});
		this.init();
	}

	init() {
		this.connection.sync();
	}

	static Instance() {
		if (!(Database.Instance instanceof Database))
			Database.Instance_ = new Database();

		return Database.Instance_.connection;
	}
}
Database.Instance_ = null;

module.exports = Database.Instance();