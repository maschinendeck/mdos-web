const Express = require("express");

const Auth = require("./src/routes/Auth");

const app = Express();
app.use(Express.static(`${__dirname}/public`));
app.get("/auth", Auth);


app.listen(9000);