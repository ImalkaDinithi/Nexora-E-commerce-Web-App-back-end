import {Product} from "../infrastructure/db/entities/Product";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "../domain/dto/product";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../infrastructure/s3";
import mongoose from "mongoose";

import Category from "../infrastructure/db/entities/category";

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { color, sort, categoryId, categorySlug } = req.query;
    const query: any = {};

    // Category filter (slug or id)
    if (categoryId && typeof categoryId === "string") {
      query.categoryId = categoryId;
    } else if (categorySlug && typeof categorySlug === "string") {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (!categoryDoc) return res.json([]); // no products if category not found
      query.categoryId = categoryDoc._id;
    }

    // Color filter
    if (color && typeof color === "string" && mongoose.Types.ObjectId.isValid(color)) {
      query.colorId = color;
    }

    // Sorting
    const sortOption: any = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;

    const products = await Product.find(query)
      .populate("colorId")
      .populate("categoryId")
      .sort(sortOption);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductsForSearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    const results = await Product.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            path: "name",
            query: search,
            tokenOrder: "any",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 2,
              maxExpansions: 256,
            },
          },
          highlight: {
            path: "name",
          },
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    next(error);
  }
};


const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateProductDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    await Product.create(result.data);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews")
      .populate("colorId")     // Poplate colorId for more info
      .populate("categoryId"); // Populate category for more info

    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { fileType } = body;

    const id = randomUUID();

    const url = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: id,
        ContentType: fileType,
      }),
      {
        expiresIn: 60,
      }
    );

    res
      .status(200)
      .json({
        url,
        publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
      });
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProductById,
  getProductsForSearchQuery,
  uploadProductImage,
};
