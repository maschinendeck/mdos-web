# MDoS web
– Web frontend of Maschinendeck Door opening System

## Usage
This application uses the node package `pm2` for daemonizing. You can install it via `(sudo) npm i -g pm2`. To account for system restarts, you have to run

```bash
pm2 startup systemd
```

and run the command that is generated.

Afterwards, Copy `.env.sample` to `.env` and fill in the necessary values. Then run `npm i` as well as `npm run install` and serve the application via reverse
proxy to the port entered in `.env` file via the webserver of your choice.

The application creates the file `database.sqlite` in the root folder, please make shure this file has adequate file permissions, as it contains user credentials.

### Uninstall service
To remove the daemonized application, simply run `npm run remove`.

### Administration
To administer the user database, run the maintenance command `npm run usermanager` which lets you add, remove and edit users via a command line wizard.

## Development
Copy `.env.sample` to `.env` and fill in the desired values. Then just run `npm i` and `npm run build` as well as `npm run dev`.

## Enrvironment variables
```javascript
/**
 * JWT secret
 *
 * @default null
 */
SECRET

/**
 * Number of hours a JWT is valid
 *
 * @default 12
 * @optional
 */
TOKEN_HOURS

/**
 * Port for the webserver to listen on
 *
 * @default 9000
 * @optional
 */
PORT

/**
 * Port for serial communication (/dev/ttyserial.something)
 * @default ""
 */
SERIALPORT

/**
 * Baudrate for Serial connection with MDoS
 *
 * @default 9600
 */
BAUDRATE

/**
 * Domain of this application
 *
 * @default null
 */
DOMAIN

/**
 * Mailserver to use for "change password" functionality
 *
 * @default hamal.uberspace.de
 * @optional
 */
MAIL_SERVER

/**
 * User for access to mailserver
 *
 * @default noreply@tuer.maschinendeck.org
 * @optional
 */
MAIL_USER

/**
 * Password for SMTP user
 *
 * @default null
 */
MAIL_PASSWORD

/**
 * SMTP port on mail server
 * 
 * @default 587
 * @optional
 */
MAIL_PORT

/**
 * MQTT server to publish to (leave empty to disable)
 * 
 * @default bridge.local
 * @optional
 */
MQTT_SERVER

/**
 * User for authentication on the MQTT server
 * 
 * @default bridge
 * @optional 
 */
MQTT_USER

/**
 * Password for authentication on the MQTT server
 * 
 * @optional 
 */
MQTT_PASSWORD

/**
 * MQTT topic to publish to
 * 
 * @default maschinendeck/security/door
 * @optional
 */
MQTT_TOPIC
```