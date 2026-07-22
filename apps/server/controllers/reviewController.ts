import { Request, Response } from "express";
import { Review } from "../models/reviewModel";
import { Order } from "../models/orderModel";

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.max(parseInt((req.query.limit as string) || "5", 10), 1);

    const filter: Record<string, unknown> = { product: productId };
    let ownReview = null;

    if (req.user) {
      ownReview = await Review.findOne({ product: productId, user: req.user._id }).populate(
        "user",
        "firstName lastName profilePicture"
      );
      if (ownReview) {
        filter._id = { $ne: ownReview._id };
      }
    }

    const effectiveLimit = page === 1 && ownReview ? Math.max(limit - 1, 0) : limit;
    const skip = page === 1 ? 0 : Math.max((page - 1) * limit - (ownReview ? 1 : 0), 0);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "firstName lastName profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(effectiveLimit),
      Review.countDocuments({ product: productId }),
    ]);

    const data = page === 1 && ownReview ? [ownReview, ...reviews] : reviews;

    res.send({
      status: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).send({ status: false, error: "productId, orderId, rating and comment are required" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id, status: "delivered" });
    if (!order) {
      return res.status(403).send({ status: false, error: "You can only review products from your delivered orders" });
    }

    const hasProduct = order.items.some((item) => item.product.toString() === productId);
    if (!hasProduct) {
      return res.status(400).send({ status: false, error: "This product is not part of the given order" });
    }

    const review = await Review.create({ user: req.user._id, product: productId, order: orderId, rating, comment });

    res.status(201).send({ status: true, data: review, message: "Review submitted successfully" });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).send({ status: false, error: "You have already reviewed this product" });
    }
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send({ status: false, error: "Review not found" });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "You can only edit your own review" });
    }

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    res.send({ status: true, data: review, message: "Review updated successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send({ status: false, error: "Review not found" });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "You can only delete your own review" });
    }

    await review.deleteOne();
    res.send({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.send({ status: true, data: reviews });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
