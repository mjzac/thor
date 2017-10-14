import { NextFunction, Request, Response, Router } from "express";
import * as passport from "passport";

import { getIndex, postPicture } from "../controllers/root";
import { getDashboard, getLogout, postLogin } from "../controllers/user";

import { isAuthenticated, isAuthorized } from "../config/passport";

import { uploadSinglePicture } from "../services/S3UploaderService";
class Root {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  // tslint:disable-next-line:no-empty
  private init() {
    this.router.get("/", getIndex);
    this.router.post("/login",
    passport.authenticate("local", { failureMessage: "Invalid username or password." }),
    postLogin);
    this.router.get("/dashboard", isAuthenticated, getDashboard);
    this.router.get("/logout", getLogout);
    this.router.post("/picture", uploadSinglePicture, postPicture );
  }
}

export const rootRouter = new Root().router;
