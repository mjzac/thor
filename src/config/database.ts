import "reflect-metadata";
import { ConnectionOptions } from "typeorm";
// tslint:disable:object-literal-sort-keys
export const dbOptions: ConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.postgres_user || "melson",
  password: "",
  database: process.env.postgres_user || "melson",
  entities: [
    __dirname + "/../models/*.js",
  ],
  autoSchemaSync: true,
};
