import { Request, Response, NextFunction } from "express";
import Order from "../infrastructure/db/entities/Order";
import User from "../infrastructure/db/entities/User";
import { getAuth } from "@clerk/express";

// Fetch last 7 days and last 30 days sales
const getSalesSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    // Ensure only admin can access
    // Optional: You can use admin middleware instead

    const today = new Date();
    const last7Days = [];
    const last30Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const total = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: 1, total: { $sum: "$totalPrice" } } },
      ]);

      last7Days.push({ _id: 7 - i, total: total[0]?.total || 0 });
    }

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const total = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: 1, total: { $sum: "$totalPrice" } } },
      ]);

      last30Days.push({ _id: 30 - i, total: total[0]?.total || 0 });
    }

    res.json({ last7Days, last30Days });
  } catch (err) {
    next(err);
  }
};

// Fetch overview cards data
const getOverviewCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSales7Days = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const totalSales30Days = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const activeCustomers = await User.countDocuments({
      lastActive: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    });

    res.json({
      totalSales7Days: totalSales7Days[0]?.total || 0,
      totalSales30Days: totalSales30Days[0]?.total || 0,
      activeCustomers,
    });
  } catch (err) {
    next(err);
  }
};

export { getSalesSummary, getOverviewCards };
