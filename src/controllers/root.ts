import * as path from "path";

import { NextFunction, Request, Response, Router } from "express";
import { getConnection } from "typeorm";

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  return res.render("index", { title: "Login", zipCodes: ["", "", "", ""] });
};
export const postPicture = (req: Request, res: Response, next: NextFunction) => {
  const pictureURL = "http://" + path.join(req.file.bucket, req.file.key);
  return res.json(req.file.bucket);
};
