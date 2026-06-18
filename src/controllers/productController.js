import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (lowStock === "true") {
    query.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("supplier", "name");
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, description, category, supplier, price, quantity, lowStockThreshold } =
    req.body;

  if (!name || !sku || !category || price === undefined) {
    throw new ApiError(400, "Name, SKU, category and price are required");
  }

  const product = await Product.create({
    name,
    sku,
    description,
    category,
    supplier: supplier || undefined,
    price,
    quantity,
    lowStockThreshold,
  });

  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, description, category, supplier, price, quantity, lowStockThreshold } =
    req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      sku,
      description,
      category,
      supplier: supplier || undefined,
      price,
      quantity,
      lowStockThreshold,
    },
    { new: true, runValidators: true }
  );

  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: {} });
});
