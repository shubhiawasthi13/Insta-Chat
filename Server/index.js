import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config({});
const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOption = {
  origin: "http://localhost5173",
  credentials: true,
};
app.use(cors(corsOption));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
