import StockTransaction from "../models/StockTransaction.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTransactions = asyncHandler(async (req, res) => {
  const { product, type, page = 1, limit = 10 } = req.query;

  const query = {};
  if (product) query.product = product;
  if (type) query.type = type;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    StockTransaction.find(query)
      .populate("product", "name sku")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    StockTransaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { product: productId, type, quantity, note } = req.body;

  if (!productId || !type || quantity === undefined) {
    throw new ApiError(400, "Product, type and quantity are required");
  }

  if (!["IN", "OUT", "ADJUSTMENT"].includes(type)) {
    throw new ApiError(400, "Type must be IN, OUT or ADJUSTMENT");
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let newQuantity;
  if (type === "IN") {
    newQuantity = product.quantity + Number(quantity);
  } else if (type === "OUT") {
    newQuantity = product.quantity - Number(quantity);
    if (newQuantity < 0) {
      throw new ApiError(400, "Insufficient stock for this operation");
    }
  } else {
    newQuantity = Number(quantity);
  }

  product.quantity = newQuantity;
  await product.save();

  const transaction = await StockTransaction.create({
    product: productId,
    type,
    quantity,
    note,
    createdBy: req.user._id,
  });

  const populated = await StockTransaction.findById(transaction._id)
    .populate("product", "name sku quantity")
    .populate("createdBy", "name");

  res.status(201).json({ success: true, data: populated });
});
