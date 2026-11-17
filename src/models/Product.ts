import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      default: "📦",
    },
    image: {
      type: String,
      default: "",
    },
    seller: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    listingType: {
      type: String,
      enum: ["For Sale", "Free", "Exchange"],
      default: "For Sale",
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Sold"],
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: "Campus Center",
      trim: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    demoKey: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;
