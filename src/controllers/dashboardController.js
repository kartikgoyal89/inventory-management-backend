import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Supplier from "../models/Supplier.js";
import StockTransaction from "../models/StockTransaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const lowStockFilter = { $expr: { $lte: ["$quantity", "$lowStockThreshold"] } };

  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    valueAgg,
    lowStockCount,
    lowStockProducts,
    recentTransactions,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Supplier.countDocuments(),
    Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$price", "$quantity"] } } } },
    ]),
    Product.countDocuments(lowStockFilter),
    Product.find(lowStockFilter).populate("category", "name").sort({ quantity: 1 }).limit(10),
    StockTransaction.find()
      .populate("product", "name sku")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalInventoryValue: valueAgg[0]?.totalValue || 0,
      lowStockCount,
      lowStockProducts,
      recentTransactions,
    },
  });
});
