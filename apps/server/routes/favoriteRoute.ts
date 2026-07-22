import express from "express";
import { getFavorites, toggleFavorite, checkFavorite } from "../controllers/favoriteController";
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/favorites", authMiddleware);

router.get("/favorites", getFavorites);
router.post("/favorites", toggleFavorite);
router.get("/favorites/check/:productId", checkFavorite);

export default router;
