import express from "express";
import { createOrder, getOrder, getUserOrders, getAllOrders } from "./../application/order";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const orderRouter = express.Router();

// Create a new order
orderRouter.route("/").post(isAuthenticated, createOrder);

// Get a single order by ID
orderRouter.route("/:id").get(getOrder);

// Users can view their own orders
orderRouter.get("/my-orders", isAuthenticated, getUserOrders);

// Admin can view all orders
orderRouter.get("/", isAuthenticated, isAdmin, getAllOrders);
