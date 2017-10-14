/**
 * Module dependencies.
 */
import * as bodyParser from "body-parser";
import * as compression from "compression";  // compresses requests
import * as redisConnect from "connect-redis"; // (session)
import * as dotenv from "dotenv";
import * as errorHandler from "errorhandler";
import * as express from "express";
import * as expressLayouts from "express-ejs-layouts";
import * as flash from "express-flash";
import * as session from "express-session";
import expressValidator = require("express-validator");
import * as lusca from "lusca";
import * as logger from "morgan";
import * as passport from "passport";
import * as path from "path";
import * as redis from "redis";
import { createConnection } from "typeorm";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });

/**
 * Routes
 */

import { rootRouter } from "./routes/root";
import { userRouter } from "./routes/user";

/**
 * API keys and Passport configuration.
 */
import { dbOptions } from "./config/database";
import * as passportConfig from "./config/passport";
// Connect the database.
createConnection(dbOptions).then((connection) => {
  // tslint:disable-next-line:no-console
  console.log("created connection.");
}).catch((err) => {
  // tslint:disable-next-line:no-console
  console.log(err);
});
class App {

  // ref to Express instance
  public express: express.Application;
  private readonly RedisStore = redisConnect(session);
  private readonly redisClient = redis.createClient();

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.launchConf();

  }
  private middleware(): void {
    this.express.set("port", process.env.PORT || 3000);
    this.express.set("views", path.join(__dirname, "../views"));
    this.express.set("view engine", "ejs");
    this.express.set("layout", "layout");
    this.express.use(expressLayouts);
    this.express.use(compression());
    this.express.use(logger("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(expressValidator());
    this.express.use(session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      store: new this.RedisStore({
        client: this.redisClient,
        host: "localhost",
        port: 6379,
        ttl: 30 * 60,
      }),
    }));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
    this.express.use(flash());
    this.express.use(lusca.xframe("SAMEORIGIN"));
    this.express.use(lusca.xssProtection(true));
    this.express.use((req, res, next) => {
      res.locals.user = req.user;
      next();
    });
    this.express.use(passportConfig.agentNeedsJSON);
    this.express.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
  }
  /**
   * Primary app routes.
   */
  private routes(): void {
    this.express.use("/", rootRouter);
    this.express.use("/user", userRouter);
  }

  private launchConf() {

    this.express.use(errorHandler());

    /**
     * Start Express server.
     */
    this.express.listen(this.express.get("port"), () => {
      // tslint:disable-next-line:no-console
      console.log(("  App is running at http://localhost:%d \
      in %s mode"), this.express.get("port"), this.express.get("env"));
      // tslint:disable-next-line:no-console
      console.log("  Press CTRL-C to stop\n");
    });
  }
}

export default new App().express;
