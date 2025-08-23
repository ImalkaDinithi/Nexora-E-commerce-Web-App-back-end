import { NextFunction, Request, Response } from "express";
import Address from "../infrastructure/db/entities/Address";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";

import { products as allProducts } from "../data"; // import your products array


import Product from "../infrastructure/db/entities/Product";

// Create new order
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = getAuth(req);

    if (!data.orderItems || data.orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Save shipping address
    const address = await Address.create(data.shippingAddress);

    // Calculate total price based on products array
    let totalPrice = 0;
    const itemsWithPrice = data.orderItems.map((item: { productId: string; quantity: number }) => {
      const product = allProducts.find(p => p._id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const quantity = Number(item.quantity) || 0;
      totalPrice += product.price * quantity;
      return {
        productId: product._id,
        quantity,
      };
    });

    if (totalPrice <= 0) {
      throw new Error("Total price must be greater than zero");
    }

    // Create order in DB
    const order = await Order.create({
      addressId: address._id,
      items: itemsWithPrice,
      userId,
      totalPrice,
    });

    res.status(201).json({ message: "Order created successfully", order });
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