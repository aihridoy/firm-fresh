import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController";
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/cart", authMiddleware);

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:itemId", updateCartItem);
router.delete("/cart/:itemId", removeFromCart);
router.delete("/cart", clearCart);

export default router;
