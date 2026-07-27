import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { spawn } from "child_process";

const PORT = process.env.PORT;

app.get("/github-webhook", (req, res) => {
  const bashChildProcess = spawn("bash", ["/home/ubuntu/script.sh"]);

  // console.log(bashChildProcess);

  // bashChildProcess.stdout.pipe(process.stdout);

  bashChildProcess.stdout.on("data", (data) => {
    console.log("Got stdout data");
    process.stdout.write(data);
  });

  bashChildProcess.stderr.on("data", (data) => {
    process.stdout.write(data);
  });

  bashChildProcess.on("close", (code) => {
    res.json({ message: "OK" });
    if (code === 0) {
      console.log("Script Executed Succesfully!");
    } else {
      console.log("Script Failed!");
    }
  });

  bashChildProcess.on("error", (err) => {
    res.json({ message: "OK" });

    console.log("Error in spawning the process.");
    console.log(err);
  });
});

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
