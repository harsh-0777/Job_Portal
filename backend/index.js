import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

import dbConnect from "./db/dbConnect.js";

//configuring enviorment files
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// middleware external
app.use(cookieParser());
app.use(cors());

app.listen(process.env.PORT || 3300, () => {
  dbConnect();
  console.log(`Server Runing on Port ${process.env.PORT}`);
});
