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
/*
 * JWT secret
 *
 * @default null
 */
SECRET

/*
 * Number of hours a JWT is valid
 *
 * @default 12
 * @optional
 */
TOKEN_HOURS

/*
 * Port for the webserver to listen on
 *
 * @default 9000
 * @optional
 */
PORT
```