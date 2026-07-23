import express from "express";
import {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listPendingFarmers,
  approveFarmer,
  rejectFarmer,
  listAllProducts,
  getProduct,
  deleteProduct,
  togglePublish,
  listPendingProducts,
  approveProduct,
  rejectProduct,
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

router.get("/admin/farmers/pending", listPendingFarmers);
router.patch("/admin/farmers/:id/approve", approveFarmer);
router.patch("/admin/farmers/:id/reject", rejectFarmer);

router.get("/admin/products", listAllProducts);
router.get("/admin/products/pending", listPendingProducts);
router.get("/admin/products/:id", getProduct);
router.delete("/admin/products/:id", deleteProduct);
router.patch("/admin/products/:id/publish", togglePublish);
router.patch("/admin/products/:id/approve", approveProduct);
router.patch("/admin/products/:id/reject", rejectProduct);

router.get("/admin/orders", listAllOrders);
router.get("/admin/orders/:id", getOrder);
router.patch("/admin/orders/:id/status", updateOrderStatus);

export default router;
