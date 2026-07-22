import { Request, Response } from "express";
import { Newsletter } from "../models/newsletterModel";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribe = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).send({ status: false, error: "Please provide a valid email address" });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.send({ status: true, message: "You're already subscribed" });
    }

    await Newsletter.create({ email });
    res.status(201).send({ status: true, message: "Subscribed! Watch your inbox for fresh updates" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
