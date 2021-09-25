# MDoS web
– Web frontend of Maschinendeck Door opening System

## Usage
Copy `.env.sample` to `.env` and fill in the necessary values. Then run `npm run build` as well as `npm start` and serve the application via reverse proxy to the port entered in `.env` file.

The application creates the file `database.sqlite` in the root folder, please make shure this file has adequate file permissions, as it contains user credentials.

### Administration
To administer the user database, run the maintenance command `npm run usermanager` which lets you add, remove and edit users via a command line wizard.

## Development
Copy `.env.sample` to `.env` and fill in the desired values. Then just run `npm run dev`.

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