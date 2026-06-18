import express from "express";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getSuppliers).post(createSupplier);
router.route("/:id").get(getSupplier).put(updateSupplier).delete(deleteSupplier);

export default router;
