import express from "express";
import isAuthenticated from "./middleware/authentication-middleware";
import { getSalesSummary, getOverviewCards } from "../application/sales";

export const salesRouter = express.Router();

// Get sales chart data (last 7 & 30 days)
salesRouter.get("/summary", isAuthenticated, getSalesSummary);

// Get overview cards data (total sales, active customers)
salesRouter.get("/overview", isAuthenticated, getOverviewCards);
