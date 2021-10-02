const mqtt = require("mqtt");

class MQTT {
	constructor() {
		this.client    = null;
		this.connected = false;

		if (process.env.MQTT_SERVER && process.env.MQTT_SERVER !== "")
			this.client = mqtt.connect(`mqtt://${process.env.MQTT_SERVER}`, {
				username : process.env.MQTT_USER || "bridge",
				password : process.env.MQTT_PASSWORD
			});
		
		this.client.on("error", error => console.log(error.message));
		this.client.on("connect", () => this.connected = true);
	}

	publish(message) {
		if (!this.client || !this.connected)
			return;

		this.client.publish(process.env.MQTT_TOPIC || "maschinendeck/security/door", message.toString());
	}

	static Instance() {
		if (!(MQTT.Instance_ instanceof MQTT))
			MQTT.Instance_ = new MQTT;
		
		return MQTT.Instance_;
	}
}
MQTT.Instance_ = null;

module.exports = MQTT.Instance();