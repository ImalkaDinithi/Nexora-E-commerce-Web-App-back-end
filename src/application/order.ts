import { NextFunction, Request, Response } from "express";
import Address from "../infrastructure/db/entities/Address";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";

// Create new order
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = getAuth(req);

    const address = await Address.create(data.shippingAddress);
    await Order.create({
      addressId: address._id,
      items: data.orderItems,
      userId: userId,
    });

    res.status(201).send({ message: "Order created successfully" });
  } catch (error) {
    next(error);
  }
};

// Get single order
const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = "123";

    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// Get all orders for logged-in user
const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    const orders = await Order.find({ userId }).populate("products.productId");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};  

// Get all orders (admin only)
const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate("products.productId").populate("userId");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export { createOrder, getOrder, getUserOrders, getAllOrders };