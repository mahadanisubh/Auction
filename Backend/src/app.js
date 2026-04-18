import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";

import connectDB from "../config/connectDB.js";
import router from "../routes/auction.routes.js";
import { initSocket } from "./sockets/index.js";

const app = express();

const PORT = process.env.PORT || 3000 ;

const server = http.createServer(app);

// Initialize Socket
const io = initSocket(server);
app.set("io", io);


app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

app.use("/", router);


const startServer = async () => {
  try {

    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("Server start error:", err);
  }
};

startServer();