import express from "express";
const app = express();

//configuring enviorment files
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(process.env.PORT || 3300, () => {
  console.log(`Server Runing on Port ${process.env.PORT}`);
});
