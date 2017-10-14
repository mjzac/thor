import { NextFunction, Request, Response, Router } from "express";

import { uploadSinglePicture } from "../services/S3UploaderService";

import { isAuthenticated } from "../config/passport";
import { postRegister, putUserPassword, updateAvatar } from "../controllers/user";
class User {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  // tslint:disable-next-line:no-empty
  private init() {
    this.router.post("/", postRegister);
    this.router.put("/password", putUserPassword);
    this.router.post("/avatar", isAuthenticated, uploadSinglePicture, updateAvatar );
  }
}

export const userRouter = new User().router;
