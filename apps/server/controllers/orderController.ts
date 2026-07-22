import { Request, Response } from "express";
import { Order, generateOrderNumber, ORDER_STATUSES, OrderStatus } from "../models/orderModel";
import { Cart } from "../models/cartModel";
import { Product } from "../models/productModel";

const DELIVERY_FEE = 50;
const SERVICE_FEE = 25;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { deliveryAddress, deliveryDate, paymentMethod, paymentDetails, items: bodyItems } = req.body;

    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).send({ status: false, error: "deliveryAddress and paymentMethod are required" });
    }

    let sourceItems: Array<{ productId: string; quantity: number }>;
    let cart = null;

    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      sourceItems = bodyItems.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
    } else {
      cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).send({ status: false, error: "Cart is empty" });
      }
      sourceItems = cart.items.map((i) => ({ productId: i.product.toString(), quantity: i.quantity }));
    }

    const orderItems = [];
    let subtotal = 0;

    for (const { productId, quantity } of sourceItems) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ status: false, error: `Product ${productId} not found` });
      }
      if (product.stock < quantity) {
        return res.status(400).send({ status: false, error: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0]?.url || "",
        farmer: product.farmer,
        price: product.price,
        quantity,
        unit: product.unit,
      });

      subtotal += product.price * quantity;
      product.stock -= quantity;
      product.purchaseCount += quantity;
      await product.save();
    }

    const totalAmount = subtotal + DELIVERY_FEE + SERVICE_FEE;

    const order = await Order.create({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      paymentDetails,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      serviceFee: SERVICE_FEE,
      totalAmount,
    });

    if (cart) {
      cart.items = [] as never;
      await cart.save();
    }

    res.status(201).send({ status: true, data: order, message: "Order placed successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.max(parseInt((req.query.limit as string) || "10", 10), 1);

    const filter = { user: req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.send({
      status: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getFarmerOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.max(parseInt((req.query.limit as string) || "10", 10), 1);

    const filter = { "items.farmer": req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.send({
      status: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ status: false, error: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isFarmerOfItem = order.items.some((item) => item.farmer.toString() === req.user._id.toString());
    if (!isOwner && !isFarmerOfItem) {
      return res.status(403).send({ status: false, error: "Not authorized to view this order" });
    }

    res.send({ status: true, data: order });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).send({ status: false, error: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ status: false, error: "Order not found" });
    }

    const isFarmerOfItem = order.items.some((item) => item.farmer.toString() === req.user._id.toString());
    if (!isFarmerOfItem) {
      return res.status(403).send({ status: false, error: "Not authorized to update this order" });
    }

    order.status = status;
    await order.save();

    res.send({ status: true, data: order, message: "Order status updated" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ status: false, error: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({ status: false, error: "Not authorized to cancel this order" });
    }
    if (order.status !== "pending") {
      return res.status(400).send({ status: false, error: "Only pending orders can be canceled" });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, purchaseCount: -item.quantity },
      });
    }

    order.status = "canceled";
    await order.save();

    res.send({ status: true, data: order, message: "Order canceled" });
  } catch (err) {
    res.status(500).send({ status: false, error: (err as Error).message });
  }
};
