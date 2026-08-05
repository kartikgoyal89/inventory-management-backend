import express from "express";
import cors from "cors";
import { spawn } from "child_process";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API is TEsting healthy" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.post("/github-webhook", (req, res) => {
  // console.log(req.headers);
  // console.log(req.body);

  const givenSignature = req.headers["x-hub-signature-256"];

  if (!givenSignature) {
    return res.status(403).json({ error: "Invalid Signature" });
  }

  const calculatedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", "kartik@123")
      .update(JSON.stringify(req.body))
      .digest("hex");

  if (givenSignature !== calculatedSignature) {
    return res.status(403).json({ error: "Invalid Signature" });
  }

  res.json({ message: "OK" });

  const bashChildProcess = spawn("bash", [
    "/home/ubuntu/inventory-management-frontend/deploy-frontend.sh",
  ]);

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

app.use(notFound);
app.use(errorHandler);

export default app;
