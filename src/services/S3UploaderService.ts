import * as aws from "aws-sdk";
import { NextFunction, Request, Response } from "express";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import { v4 as uuid } from "uuid";
aws.config.update({
  accessKeyId: process.env.AWS_ACCES_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const s3 = new aws.S3();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multerS3({
    acl: "public-read",
    bucket: "static.mjzac.com",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      if (file.mimetype.indexOf("image") === -1) {
        return cb(new Error("Invalid file"), undefined);
      } else {
        const randomName = uuid() + "." + file.originalname.split(".").pop();
        cb(undefined, randomName);
      }
    },
    s3,
  }),
});
export const uploadSinglePicture = function uploadSinglePicture(req: Request, res: Response, next: NextFunction) {
  return upload.single("picture")(req, res, next);
};
