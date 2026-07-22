import mongoose, { Schema, Document } from "mongoose";

export interface NewsletterDocument extends Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<NewsletterDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Newsletter = mongoose.model<NewsletterDocument>("Newsletter", newsletterSchema);
