const crypto = require("crypto");

class Secret extends String {
	constructor() {
		super();
		const appendix = crypto.randomUUID();
		this.value = `${process.env.SECRET}.${appendix}`
	}

	toString() {
		return this.value;
	}

	valueOf() {
		return this.value;
	}

	static get Instance() {
		if (!(Secret.Instance_ instanceof Secret))
			Secret.Instance_ = new Secret();
		return Secret.Instance_;
	}
}
Secret.Instance_ = null;

module.exports = Secret.Instance.toString();