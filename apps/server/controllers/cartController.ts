import { Request, Response } from "express";
import { Cart } from "../models/cartModel";
import { Product } from "../models/productModel";

export const getCart = async (req: Request, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.send({ status: true, data: cart });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).send({ status: false, error: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isPublished) {
      return res.status(404).send({ status: false, error: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: product._id, quantity: Number(quantity) } as never);
    }

    await cart.save();
    await cart.populate("items.product");

    res.send({ status: true, data: cart, message: "Item added to cart" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).send({ status: false, error: "quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).send({ status: false, error: "Cart not found" });
    }

    const item = cart.items.find((i) => i._id.toString() === req.params.itemId);
    if (!item) {
      return res.status(404).send({ status: false, error: "Cart item not found" });
    }

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate("items.product");

    res.send({ status: true, data: cart, message: "Cart item updated" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).send({ status: false, error: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId) as never;
    await cart.save();
    await cart.populate("items.product");

    res.send({ status: true, data: cart, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { new: true, upsert: true });
    res.send({ status: true, data: cart, message: "Cart cleared" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
