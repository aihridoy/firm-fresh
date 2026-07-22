import express from "express";
import {
  createOrder,
  getUserOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController";
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/orders", authMiddleware);

router.post("/orders", createOrder);
router.get("/orders", getUserOrders);
router.get("/orders/farmer", getFarmerOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/cancel", cancelOrder);

export default router;
