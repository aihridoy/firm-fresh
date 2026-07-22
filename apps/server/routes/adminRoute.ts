import express from "express";
import {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listAllProducts,
  getProduct,
  deleteProduct,
  togglePublish,
  listAllOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/adminController";
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Every /api/admin/* route requires an authenticated admin
router.use("/admin", authMiddleware, isAdmin);

router.get("/admin/dashboard", getDashboard);

router.get("/admin/users", listUsers);
router.get("/admin/users/:id", getUser);
router.put("/admin/users/:id", updateUser);
router.delete("/admin/users/:id", deleteUser);

router.get("/admin/products", listAllProducts);
router.get("/admin/products/:id", getProduct);
router.delete("/admin/products/:id", deleteProduct);
router.patch("/admin/products/:id/publish", togglePublish);

router.get("/admin/orders", listAllOrders);
router.get("/admin/orders/:id", getOrder);
router.patch("/admin/orders/:id/status", updateOrderStatus);

export default router;
