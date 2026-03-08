import fs from "fs";
import path from "path";

/* ===== INTERFACE ===== */
export interface Product {
  id: number;
  name: string;
  price: number;
  department: string[];
  brand: string;
  images: string[];
  sizes: string[];
  category?: string;
  isNew?: boolean;
  description?: string;
}

/* ===== DATA PATH ===== */
const dataPath = path.join(process.cwd(), "data", "products.json");

/* ===== FUNCTIONS ===== */
export const getAllProducts = (): Product[] => {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data) as Product[];
};

export const saveProducts = (products: Product[]): void => {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
};

export const addProduct = (product: Product): void => {
  const products = getAllProducts();
  products.push(product);
  saveProducts(products);
};

export const deleteProduct = (id: number): void => {
  const products = getAllProducts().filter((p) => p.id !== id);
  saveProducts(products);
};