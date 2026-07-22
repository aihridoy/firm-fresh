import { Request, Response } from "express";
import multer from "multer";
import { Product } from "../models/productModel";
import { Review } from "../models/reviewModel";
import cloudinary from "../utils/cloudinary";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

const uploadToCloudinary = (buffer: Buffer): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "farmfresh/products", resource_type: "image" },
      (error: unknown, result: any) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${(error as Error).message}`));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  newest: { createdAt: -1 },
  featured: { purchaseCount: -1 },
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      sort,
      page = "1",
      limit = "12",
      farmer,
      location,
      organic,
      minPrice,
      maxPrice,
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { isPublished: true };
    if (category) filter.category = category;
    if (farmer) filter.farmer = farmer;
    if (location) filter.farmLocation = { $regex: location, $options: "i" };
    if (organic === "true") filter.features = "organic";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      const price: Record<string, number> = {};
      if (minPrice) price.$gte = parseFloat(minPrice);
      if (maxPrice) price.$lte = parseFloat(maxPrice);
      filter.price = price;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
    const sortSpec = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("farmer", "firstName lastName farmerDetails")
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.send({
      status: true,
      data: products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isPublished: true })
      .populate("farmer", "firstName lastName farmerDetails")
      .sort({ purchaseCount: -1, createdAt: -1 })
      .limit(8);

    res.send({ status: true, data: products });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "firstName lastName farmerDetails profilePicture createdAt"
    );

    if (!product) {
      return res.status(404).send({ status: false, error: "Product not found" });
    }

    const reviewStats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const { avgRating = 0, count = 0 } = reviewStats[0] || {};

    res.send({
      status: true,
      data: { ...product.toObject(), avgRating, reviewCount: count },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getFarmerProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ farmer: req.params.farmerId }).sort({ createdAt: -1 });
    res.send({ status: true, data: products, count: products.length });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, unit, stock, features, farmLocation, harvestDate } = req.body;

    if (!name || !description || !category || !price || !unit || !farmLocation) {
      return res.status(400).send({ status: false, error: "Missing required product fields" });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).send({ status: false, error: "At least one product image is required" });
    }

    const uploaded = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));
    const images = uploaded.map((result, i) => ({ url: result.secure_url, alt: `${name} image ${i + 1}` }));

    const product = await Product.create({
      farmer: req.user._id,
      name,
      description,
      category,
      price: parseFloat(price),
      unit,
      stock: parseInt(stock, 10) || 0,
      images,
      features: Array.isArray(features) ? features : features ? [features] : [],
      farmLocation,
      harvestDate: harvestDate || undefined,
    });

    res.status(201).send({ status: true, data: product, message: "Product created successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ status: false, error: "Product not found" });
    }
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "You can only update your own products" });
    }

    const updates = { ...req.body };
    delete updates.farmer;

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length > 0) {
      const uploaded = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));
      updates.images = uploaded.map((result, i) => ({ url: result.secure_url, alt: `${product.name} image ${i + 1}` }));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });

    res.send({ status: true, data: updated, message: "Product updated successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ status: false, error: "Product not found" });
    }
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "You can only update your own products" });
    }

    product.isPublished = !product.isPublished;
    await product.save();

    res.send({ status: true, data: product, message: `Product ${product.isPublished ? "published" : "unpublished"}` });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ status: false, error: "Product not found" });
    }
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.send({ status: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
