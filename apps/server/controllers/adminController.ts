import { Request, Response } from "express";
import { Product } from "../models/productModel";
import { Order, ORDER_STATUSES, OrderStatus } from "../models/orderModel";
import { Review } from "../models/reviewModel";
const { User } = require("../models/userModel");

const fail = (res: Response, err: unknown) =>
  res.status(500).send({ status: false, error: (err as Error).message });

const pageArgs = (req: Request) => {
  const page = Math.max(parseInt((req.query.page as string) || "1", 10) || 1, 1);
  const limit = Math.max(parseInt((req.query.limit as string) || "10", 10) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

const paginated = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

// ---- Dashboard ----

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const [usersByRole, totalProducts, totalOrders, revenueAgg, recentOrders, recentUsers] = await Promise.all([
      User.aggregate([{ $group: { _id: "$userType", count: { $sum: 1 } } }]),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $ne: "canceled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find({}).populate("user", "firstName lastName email").sort({ createdAt: -1 }).limit(10),
      User.find({}, "-password -refreshToken").sort({ createdAt: -1 }).limit(10),
    ]);

    const roles: Record<string, number> = {};
    for (const r of usersByRole) roles[r._id] = r.count;

    res.send({
      status: true,
      data: {
        users: {
          total: Object.values(roles).reduce((a, b) => a + b, 0),
          customers: roles.customer ?? 0,
          farmers: roles.farmer ?? 0,
          admins: roles.admin ?? 0,
        },
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total ?? 0,
        recentOrders,
        recentUsers,
      },
    });
  } catch (err) {
    fail(res, err);
  }
};

// ---- Users ----

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = pageArgs(req);
    const { role, search } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (role) filter.userType = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter, "-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.send({ status: true, data: users, pagination: paginated(page, limit, total) });
  } catch (err) {
    fail(res, err);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id, "-password -refreshToken");
    if (!user) return res.status(404).send({ status: false, error: "User not found" });
    res.send({ status: true, data: user });
  } catch (err) {
    fail(res, err);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).send({ status: false, error: "User not found" });
    if (target.userType === "admin" && String(target._id) !== String(req.user!._id)) {
      return res.status(403).send({ status: false, error: "Admins cannot modify other admins." });
    }

    const allowed = ["firstName", "lastName", "phone", "address", "bio", "userType"] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) (target as Record<string, unknown>)[key] = req.body[key];
    }
    await target.save();

    const user = await User.findById(target._id, "-password -refreshToken");
    res.send({ status: true, data: user, message: "User updated" });
  } catch (err) {
    fail(res, err);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).send({ status: false, error: "User not found" });
    if (target.userType === "admin") {
      return res.status(403).send({ status: false, error: "Admin accounts cannot be deleted." });
    }

    await User.deleteOne({ _id: target._id });
    res.send({ status: true, message: "User deleted" });
  } catch (err) {
    fail(res, err);
  }
};

// ---- Farmer Approval ----

export const listPendingFarmers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = pageArgs(req);
    const { status, search } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { userType: "farmer" };
    if (status) filter.approvalStatus = status;
    else filter.approvalStatus = "pending";
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "farmerDetails.farmName": { $regex: search, $options: "i" } },
      ];
    }

    const [farmers, total] = await Promise.all([
      User.find(filter, "-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.send({ status: true, data: farmers, pagination: paginated(page, limit, total) });
  } catch (err) {
    fail(res, err);
  }
};

export const approveFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await User.findById(req.params.id);
    if (!farmer) return res.status(404).send({ status: false, error: "User not found" });
    if (farmer.userType !== "farmer") {
      return res.status(400).send({ status: false, error: "User is not a farmer" });
    }

    farmer.approvalStatus = "approved";
    await farmer.save();

    const user = await User.findById(farmer._id, "-password -refreshToken");
    res.send({ status: true, data: user, message: "Farmer approved" });
  } catch (err) {
    fail(res, err);
  }
};

export const rejectFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await User.findById(req.params.id);
    if (!farmer) return res.status(404).send({ status: false, error: "User not found" });
    if (farmer.userType !== "farmer") {
      return res.status(400).send({ status: false, error: "User is not a farmer" });
    }

    farmer.approvalStatus = "rejected";
    await farmer.save();

    const user = await User.findById(farmer._id, "-password -refreshToken");
    res.send({ status: true, data: user, message: "Farmer rejected" });
  } catch (err) {
    fail(res, err);
  }
};

// ---- Products ----

export const listAllProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = pageArgs(req);
    const { category, search, published, farmer, approval } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (farmer) filter.farmer = farmer;
    if (published === "true") filter.isPublished = true;
    if (published === "false") filter.isPublished = false;
    if (approval) filter.approvalStatus = approval;
    if (search) filter.name = { $regex: search, $options: "i" };

    const [products, total] = await Promise.all([
      Product.find(filter).populate("farmer", "firstName lastName email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.send({ status: true, data: products, pagination: paginated(page, limit, total) });
  } catch (err) {
    fail(res, err);
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate("farmer", "firstName lastName email");
    if (!product) return res.status(404).send({ status: false, error: "Product not found" });
    res.send({ status: true, data: product });
  } catch (err) {
    fail(res, err);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send({ status: false, error: "Product not found" });
    await Review.deleteMany({ product: product._id });
    res.send({ status: true, message: "Product deleted" });
  } catch (err) {
    fail(res, err);
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ status: false, error: "Product not found" });
    product.isPublished = !product.isPublished;
    await product.save();
    res.send({ status: true, data: product, message: product.isPublished ? "Product published" : "Product unpublished" });
  } catch (err) {
    fail(res, err);
  }
};

// ---- Product Approval ----

export const listPendingProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = pageArgs(req);
    const { status, search, category } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status) filter.approvalStatus = status;
    else filter.approvalStatus = "pending";
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const [products, total] = await Promise.all([
      Product.find(filter).populate("farmer", "firstName lastName email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.send({ status: true, data: products, pagination: paginated(page, limit, total) });
  } catch (err) {
    fail(res, err);
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ status: false, error: "Product not found" });

    product.approvalStatus = "approved";
    product.isPublished = true;
    await product.save();

    res.send({ status: true, data: product, message: "Product approved and published" });
  } catch (err) {
    fail(res, err);
  }
};

export const rejectProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({ status: false, error: "Product not found" });

    product.approvalStatus = "rejected";
    product.isPublished = false;
    await product.save();

    res.send({ status: true, data: product, message: "Product rejected" });
  } catch (err) {
    fail(res, err);
  }
};

// ---- Orders ----

export const listAllOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = pageArgs(req);
    const { status } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "firstName lastName email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.send({ status: true, data: orders, pagination: paginated(page, limit, total) });
  } catch (err) {
    fail(res, err);
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "firstName lastName email phone");
    if (!order) return res.status(404).send({ status: false, error: "Order not found" });
    res.send({ status: true, data: order });
  } catch (err) {
    fail(res, err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).send({ status: false, error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ status: false, error: "Order not found" });
    order.status = status;
    await order.save();
    res.send({ status: true, data: order, message: "Order status updated" });
  } catch (err) {
    fail(res, err);
  }
};
