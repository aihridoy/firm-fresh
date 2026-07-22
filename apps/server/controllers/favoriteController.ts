import { Request, Response } from "express";
import { Favorite } from "../models/favoriteModel";

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate("product").sort({ createdAt: -1 });
    res.send({ status: true, data: favorites });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).send({ status: false, error: "productId is required" });
    }

    const existing = await Favorite.findOne({ user: req.user._id, product: productId });
    if (existing) {
      await existing.deleteOne();
      return res.send({ status: true, favorited: false, message: "Removed from favorites" });
    }

    await Favorite.create({ user: req.user._id, product: productId });
    res.send({ status: true, favorited: true, message: "Added to favorites" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id, product: req.params.productId });
    res.send({ status: true, favorited: !!favorite });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
