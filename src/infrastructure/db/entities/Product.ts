import mongoose, { Schema, Document, Types } from "mongoose";

interface IColor extends Document {
  name: string;
}

const ColorSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const Color = mongoose.model<IColor>("Color", ColorSchema);

export interface IProduct extends Document {
  categoryId: Types.ObjectId;
  name: string;
  price: number;
  stripePriceId: string; // ✅ now TypeScript knows about it
  image: string;
  stock: number;
  description: string;
  reviews: Types.ObjectId[];
  colorId: IColor["_id"];
}

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reviews: [{                     
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    default: [],
  }],
  colorId: {
    type: Schema.Types.ObjectId,
    ref: "Color",
    required: true
  },
});

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
export { Product, Color };
