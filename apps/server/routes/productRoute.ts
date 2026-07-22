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
const { authMiddleware, isFarmer } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/products", listProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/products/farmer/:farmerId", getFarmerProducts);
router.get("/products/:id", getProductById);

router.post("/products", authMiddleware, isFarmer, upload.array("images", 5), createProduct);
router.put("/products/:id", authMiddleware, isFarmer, upload.array("images", 5), updateProduct);
router.patch("/products/:id/publish", authMiddleware, isFarmer, togglePublish);
router.delete("/products/:id", authMiddleware, isFarmer, deleteProduct);

export default router;
