import express from "express";
import { subscribe } from "../controllers/newsletterController";

const router = express.Router();

router.post("/newsletter", subscribe);

export default router;
