import mongoose, { Schema, Document, Types } from "mongoose";

export const PRODUCT_CATEGORIES = ["vegetables", "fruits", "grains", "dairy", "herbs", "honey"] as const;
export const PRODUCT_UNITS = ["kg", "lbs", "piece", "liter", "dozen", "bundle"] as const;
export const PRODUCT_FEATURES = [
  "organic",
  "pesticide-free",
  "fresh",
  "non-gmo",
  "local",
  "sustainable",
  "fair-trade",
  "gluten-free",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductUnit = (typeof PRODUCT_UNITS)[number];
export type ProductFeature = (typeof PRODUCT_FEATURES)[number];

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductDocument extends Document {
  farmer: Types.ObjectId;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  stock: number;
  images: ProductImage[];
  features: ProductFeature[];
  farmLocation: string;
  harvestDate?: Date;
  isPublished: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<ProductDocument>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: PRODUCT_UNITS, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: {
      type: [productImageSchema],
      required: true,
      validate: {
        validator: (val: ProductImage[]) => val.length >= 1 && val.length <= 5,
        message: "A product must have between 1 and 5 images.",
      },
    },
    features: { type: [String], enum: PRODUCT_FEATURES, default: [] },
    farmLocation: { type: String, required: true },
    harvestDate: { type: Date },
    isPublished: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    purchaseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<ProductDocument>("Product", productSchema);
