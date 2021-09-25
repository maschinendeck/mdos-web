const crypto             = require("crypto");
const {DataTypes, Model} = require("sequelize");
const Db                 = require("../Database");

class User extends Model {
	static GenerateSalt = () => {
		const salt = crypto.randomUUID();

		return crypto.createHash("md5").update(salt).digest("hex").substr(0, 12);
	}

	static GeneratePassword = () => {
		return Math.random().toString(36).slice(-8);
	}

	static HashPassword(password, salt) {
		return crypto.createHash("sha512").update(`${password}.${salt}`).digest("hex").toString();
	}

	static Can(capability, role) {
		return (User.Roles[role] & capability) === capability;
	}
}
// rights management via 16bit bitmask
User.Roles = {
	guest  : 0b0000000000000000,
	member : 0b0000000000000001,
	admin  : 0b1111111111111111
};
User.Capabilities = {
	OPEN_DOOR : 0b0000000000000001,
 	RESTART   : 0b0000000000000010,
	ADD_USER  : 0b0000000000010000,
}

User.init({
	firstname : {
		type      : DataTypes.STRING,
		allowNull : false,
		validate  : {
			is : {
				args : /^[A-Z][a-zA-Z]+$/,
				msg  : "First name has to start with an uppercase letter and can not be empty." 
			}
		}
	},
	lastname : {
		type      : DataTypes.STRING,
		allowNull : false,
		validate  : {
			is : {
				args : /^[A-Z][a-zA-Z]+$/,
				msg  : "Last name has to start with an uppercase letter and can not be empty." 
			}
		}
	},
	email : {
		type      : DataTypes.STRING,
		allowNull : false,
		validate  : {
			isEmail  : {
				msg  : "email is not an valid email address"
			}
		}
	},
	nickname : {
		type      : DataTypes.STRING,
		allowNull : true
	},
	password : {
		type      : DataTypes.STRING(128),
		allowNull : true
	},
	salt : {
		type      : DataTypes.STRING(12),
		allowNull : false
	},
	role : {
		type      : DataTypes.STRING,
		allowNull : false,
		defaultValue : "guest"
	}
}, {
	sequelize : Db
});

module.exports = User;