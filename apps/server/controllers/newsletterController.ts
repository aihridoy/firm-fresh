import { Request, Response } from "express";
import { Newsletter } from "../models/newsletterModel";
const { sendNewsletterWelcomeEmail } = require("../utils/email");

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

    // Welcome email is best-effort: the subscription itself already succeeded
    try {
      await sendNewsletterWelcomeEmail(email);
    } catch (emailErr) {
      console.error("Newsletter welcome email failed:", (emailErr as Error).message);
    }

    res.status(201).send({ status: true, message: "Subscribed! A welcome email is on its way" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
