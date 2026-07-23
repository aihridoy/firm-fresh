import express from "express";
import {
  listProducts,
  getFeaturedProducts,
  getFarmerProducts,
  getProductById,
  createProduct,
  updateProduct,
  togglePublish,
  deleteProduct,
  upload,
} from "../controllers/productController";
const { authMiddleware, isFarmer, isApprovedFarmer } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/products", listProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/products/farmer/:farmerId", getFarmerProducts);
router.get("/products/:id", getProductById);

router.post("/products", authMiddleware, isApprovedFarmer, upload.array("images", 5), createProduct);
router.put("/products/:id", authMiddleware, isApprovedFarmer, upload.array("images", 5), updateProduct);
router.patch("/products/:id/publish", authMiddleware, isApprovedFarmer, togglePublish);
router.delete("/products/:id", authMiddleware, isApprovedFarmer, deleteProduct);

export default router;
