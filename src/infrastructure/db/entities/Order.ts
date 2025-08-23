import mongoose, { Document, Schema } from "mongoose";

interface Item {
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  userId: string;
  items: Item[];
  addressId: mongoose.Schema.Types.ObjectId;
  totalPrice: number;
  orderStatus: "PENDING" | "SHIPPED" | "FULFILLED" | "CANCELLED";
  paymentMethod: "COD" | "CREDIT_CARD";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
}

const ItemSchema = new Schema<Item>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  items: { type: [ItemSchema], required: true },
  addressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, enum: ["PENDING", "SHIPPED", "FULFILLED", "CANCELLED"], default: "PENDING" },
  paymentMethod: { type: String, enum: ["COD", "CREDIT_CARD"], default: "CREDIT_CARD" },
  paymentStatus: { type: String, enum: ["PENDING", "PAID", "REFUNDED"], default: "PENDING" },
}, { timestamps: true });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
