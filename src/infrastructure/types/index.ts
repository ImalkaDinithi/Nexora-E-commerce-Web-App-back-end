export interface Color {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  colorId: string; // Link to Color entity
}