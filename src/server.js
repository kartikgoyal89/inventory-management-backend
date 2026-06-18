import dotenv from "dotenv";
dotenv.config({path: "../.env"});

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT ;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
