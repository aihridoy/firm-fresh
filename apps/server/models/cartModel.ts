import mongoose, { Schema, Document, Types } from "mongoose";

export interface CartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
}

export interface CartDocument extends Document {
  user: Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new Schema<CartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<CartDocument>("Cart", cartSchema);
