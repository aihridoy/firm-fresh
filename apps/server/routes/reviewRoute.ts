import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/reviewController";
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/reviews/product/:productId", optionalAuth, getProductReviews);
router.get("/reviews/user/:userId", getUserReviews);

router.post("/reviews", authMiddleware, createReview);
router.put("/reviews/:id", authMiddleware, updateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
