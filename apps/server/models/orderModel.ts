import mongoose, { Schema, Document, Types } from "mongoose";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "canceled"] as const;
export const PAYMENT_METHODS = ["card", "bkash", "nagad"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface OrderItem {
  product: Types.ObjectId;
  productName: string;
  productImage: string;
  farmer: Types.ObjectId;
  price: number;
  quantity: number;
  unit: string;
}

export interface PaymentDetails {
  cardLast4?: string;
  transactionId?: string;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  orderNumber: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryDate?: Date;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String },
    productImage: { type: String },
    farmer: { type: Schema.Types.ObjectId, ref: "User" },
    price: { type: Number },
    quantity: { type: Number },
    unit: { type: String },
  },
  { _id: false }
);

const paymentDetailsSchema = new Schema<PaymentDetails>(
  {
    cardLast4: { type: String },
    transactionId: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    deliveryAddress: { type: String, required: true },
    deliveryDate: { type: Date },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    paymentDetails: { type: paymentDetailsSchema },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 50 },
    serviceFee: { type: Number, default: 25 },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `FB-${year}-${random}`;
}

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
