import express from "express";
import { createOrder, getOrder, getUserOrders, getAllOrders } from "./../application/order";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const orderRouter = express.Router();

// Create a new order
orderRouter.route("/").post( isAuthenticated, createOrder);

// Admin can view all orders
orderRouter.get("/", getAllOrders);

// Users can view their own orders
orderRouter.get("/my-orders", isAuthenticated, getUserOrders);

// Get a single order by ID
orderRouter.route("/:id").get(isAuthenticated, getOrder);



