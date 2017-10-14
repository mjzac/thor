"use strict";
import * as crypto from "crypto";
import * as path from "path";

import * as async from "async";
import { default as base64url } from "base64url-adhoc";
import * as bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import * as request from "request";
import { getConnection } from "typeorm";

import { User } from "../models/User";

export const postRegister = async (req: Request, res: Response) => {
  const connection = getConnection();
  req.sanitize("email").trim();
  const username: string = req.body.email;
  req.sanitize("password").trim();
  const password = req.body.password as string;
  req.sanitize("cnfPassword").trim();
  const cnfPassword = req.body.cnfPassword as string;
  if (password !== cnfPassword) {
    res.status(400).json({ error: "Passwords doesn't match" });
  }
  const newUser = new User();
  newUser.email = username;
  newUser.password = await bcrypt.hash(password, 10);
  newUser.access_token = base64url(crypto.randomBytes(36));
  try {
    const userRepo = await connection.getRepository(User);
    const persistedUser = await userRepo.persist(newUser);
    if (req.wantsJSON) {
      return res.json({ message: "success" });
    } else {
      res.render("index", {
        title: "API Examples",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: `${error}` });
  }
};

export const getDashboard = async (req: Request, res: Response) => {
  return res.render("dashboard", { title: "Home", layout: "loggedin_layout", user: req.user });
};
export const putUserPassword = async (req: Request, res: Response) => {
  req.sanitize("newPassword").trim();
  const newPassword: string = req.body.newPassword;
  const user: User = req.user;
  user.password = await bcrypt.hash(newPassword, 10);
  try {
    const connection = getConnection();
    const userRepo = await connection.getRepository(User);
    const persistedUser = await userRepo.persist(user);
    req.user = user;
    if (req.wantsJSON) {
      return res.json({ message: "success" });
    } else {
      res.render("index", {
        title: "API Examples",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: `${error}` });
  }
};

export const postLogin = (req: Request, res: Response) => {
  if (req.wantsJSON) {
    res.set("X-Authorization-Token", req.user.access_token);
    return res.status(200).json({ message: "Success" });
  } else {
    res.redirect("/dashboard");
  }
};

export const getLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy(() => {
    return res.redirect("/");
  });
};

export const updateAvatar = async (req: Request, res: Response) => {
  const avatarURL = "http://" + path.join(req.file.bucket, req.file.key);
  return res.json({ avatarURL });
};
