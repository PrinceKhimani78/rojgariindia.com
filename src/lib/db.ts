import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: process.env.DB_HOST, // 127.0.0.1
  user: process.env.DB_USER, // root
  password: process.env.DB_PASS, // empty
  database: process.env.DB_NAME, // comingsoon
});
