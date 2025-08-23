// scripts/importProducts.ts
import Stripe from "stripe";
import { products } from "./src/data"; // adjust path as needed
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

async function importProducts() {
  for (const product of products) {
    try {
      // Create product in Stripe
      const stripeProduct = await stripe.products.create({
        name: product.name,
      });

      // Create price for the product
      const stripePrice = await stripe.prices.create({
        unit_amount: product.price * 100, // price in cents
        currency: "usd", // or "lkr" / whatever currency
        product: stripeProduct.id,
      });

      console.log(
        `✅ Imported: ${product.name} → Price ID: ${stripePrice.id}`
      );
    } catch (error: any) {
      console.error(`❌ Failed to import ${product.name}:`, error.message);
    }
  }
}

importProducts();
