import * as bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import * as _ from "lodash";
import * as passport from "passport";
import * as passportBearer from "passport-http-bearer";
import * as passportLocal from "passport-local";
import * as request from "request";
import { getConnection } from "typeorm";

import { User } from "../models/User";

const BearerStrategy = passportBearer.Strategy;
const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<User, number>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser<User|boolean, number>(async (id, done) => {
  const connection = getConnection();
  const userRepository = await connection.getRepository(User);
  try {
    const user = await userRepository.findOneById(id);
    if (!user) {
      return done(undefined, false);
    }
    return done(undefined, user);
  } catch (error) {
    return done(error, undefined);
  }
});

/**
 * Sign in using access token.
 */
passport.use(new BearerStrategy(async (token, done) => {
  const connection = getConnection();
  const userRepository = await connection.getRepository(User);
  try {
    const user = await userRepository.findOne({ access_token: token });
    if (!user) {
      return done(undefined, false);
    }
    return done(undefined, user, { message: "", scope: "all" });
  } catch (error) {
    return done(error, undefined);
  }
}));

/**
 * Sign in using Email and Password.
 */
// tslint:disable-next-line:max-line-length
passport.use(new LocalStrategy({ usernameField: "email", passReqToCallback: true }, async (req, email, password, done) => {
  const connection = getConnection();
  const userRepository = await connection.getRepository(User);
  try {
    const user = await userRepository.findOne({ email });
    if (!user) {
      return done(undefined, false, { message: "Invalid email or password." });
    }
    // Compare the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return done(undefined, false, { message: "Invalid email or password." });
    }
    done(undefined, user);
  } catch (error) {
    return done(error, undefined);
  }
},
));
export const agentNeedsJSON = (req: Request, res: Response, next: NextFunction) => {
  req.wantsJSON = req.header("Accept").toLowerCase() === "application/json";
  next();
};
/**
 * Login Required middleware.
 */
export let isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  } else if (req.header("Authorization") || req.body.access_token || req.query.access_token) {
    passport.authenticate("bearer", { session: false })(req, res, next);
  } else {
    if (req.wantsJSON) {
      return res.status(401).json({ error: "Unauthenticated request." });
    } else {
      res.redirect("/");
    }
  }
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  next();
};

declare global {
  namespace Express {
    // tslint:disable-next-line:interface-name
    interface Request {
      wantsJSON: boolean;
    }
    namespace Multer {
      // tslint:disable-next-line:interface-name
      interface File {
        location: string;
        etag: string;
        bucket: string;
        key: string;
      }
    }
  }
}
