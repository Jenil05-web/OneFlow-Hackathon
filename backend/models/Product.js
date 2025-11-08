// backend/models/Product.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Product Schema
 * Represents products/services that can be used in Sales Orders, Purchase Orders, Invoices, and Expenses
 */
const ProductSchema = new Schema(
  {
    // Basic info
    name: { type: String, required: true, trim: true, unique: true },
    
    // Product types (can be multiple)
    types: {
      sales: { type: Boolean, default: false }, // Can be used in Sales Orders/Invoices
      purchase: { type: Boolean, default: false }, // Can be used in Purchase Orders/Vendor Bills
      expenses: { type: Boolean, default: false }, // Can be used in Expenses
    },
    
    // Pricing
    salesPrice: { type: Number, default: 0, min: 0 }, // Selling price
    salesTaxes: { type: Number, default: 0, min: 0 }, // Tax rate for sales (%)
    cost: { type: Number, default: 0, min: 0 }, // Cost price
    
    // Unit of measurement
    unit: { type: String, default: "Unit" }, // e.g., "Kg", "Litre", "Unit", "Hour"
    
    // Description
    description: { type: String, default: "" },
    
    // Status
    active: { type: Boolean, default: true },
    
    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);

