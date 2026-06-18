import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort({ name: 1 });
  res.json({ success: true, data: suppliers });
});

export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, "Supplier not found");
  res.json({ success: true, data: supplier });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name) throw new ApiError(400, "Supplier name is required");
  const supplier = await Supplier.create({ name, email, phone, address });
  res.status(201).json({ success: true, data: supplier });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, address },
    { new: true, runValidators: true }
  );
  if (!supplier) throw new ApiError(404, "Supplier not found");
  res.json({ success: true, data: supplier });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const inUse = await Product.exists({ supplier: req.params.id });
  if (inUse) {
    throw new ApiError(400, "Cannot delete a supplier that has products assigned to it");
  }
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) throw new ApiError(404, "Supplier not found");
  res.json({ success: true, data: {} });
});
