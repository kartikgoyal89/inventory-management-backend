import express from "express";
import cors from "cors";
import { spawn } from "child_process";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import crypto from "crypto";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

app.post(
  "/github-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const givenSignature = req.headers["x-hub-signature-256"];

    console.log("GitHub signature:", givenSignature);
    console.log("Is Buffer:", Buffer.isBuffer(req.body));

    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Is Buffer:", Buffer.isBuffer(req.body));
    console.log("Body length:", req.body?.length);

    if (!givenSignature) {
      return res.status(403).json({
        error: "Invalid Signature",
      });
    }

    const calculatedSignature =
      "sha256=" +
      crypto.createHmac("sha256", "kartik@123").update(req.body).digest("hex");

    console.log("Calculated signature:", calculatedSignature);

    if (givenSignature !== calculatedSignature) {
      return res.status(403).json({
        error: "Invalid Signature",
      });
    }

    // Tell GitHub that webhook was received
    res.status(200).json({
      message: "OK",
    });

    // Start deployment
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
      if (code === 0) {
        console.log("Script Executed Successfully!");
      } else {
        console.log("Script Failed!");
      }
    });

    bashChildProcess.on("error", (err) => {
      console.log("Error in spawning the process.");
      console.log(err);
    });
  },
);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API is TEsting healthy" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(express.json());

app.use(notFound);
app.use(errorHandler);

export default app;
