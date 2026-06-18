import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
    // IN/OUT: amount moved. ADJUSTMENT: the new absolute stock level.
    quantity: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("StockTransaction", stockTransactionSchema);
