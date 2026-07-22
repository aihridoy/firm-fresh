import mongoose, { Schema, Document, Types } from "mongoose";

export interface FavoriteDocument extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export const Favorite = mongoose.model<FavoriteDocument>("Favorite", favoriteSchema);
