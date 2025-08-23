import { z } from "zod";

const ColorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

const CreateProductDTO = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  stock: z.number(),
  price: z.number().nonnegative(),
  colorId: z.string().uuid().optional(),
});

export { CreateProductDTO, ColorSchema};
