import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Product } from "../models/productModel";

/* =========================
   DATA PATH
========================= */

const dataPath = path.join(process.cwd(), "data", "products.json");

/* =========================
   HELPER: READ / WRITE FILE
========================= */

const getAllProducts = (): Product[] => {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }

  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data) as Product[];
};

const saveProducts = (products: Product[]): void => {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
};

/* =========================================
   HELPER: APPLY FILTER
========================================= */

const applyFilters = (
  productList: Product[],
  query: Request["query"]
): Product[] => {
  let filtered = [...productList];

  const { brand, category, department, minPrice, maxPrice, sort, search } =
    query;

  const normalize = (val: unknown): string[] =>
    val ? (Array.isArray(val) ? val : [val]).map(String) : [];

  const brandFilter = normalize(brand);
  const categoryFilter = normalize(category);
  const departmentFilter = normalize(department);

  if (brandFilter.length > 0) {
    filtered = filtered.filter(
      (p: any) =>
        p.brand &&
        brandFilter.some((b) => b.toLowerCase() === p.brand.toLowerCase())
    );
  }

  if (categoryFilter.length > 0) {
    filtered = filtered.filter(
      (p) =>
        p.category &&
        categoryFilter.some(
          (c) => c.toLowerCase() === p.category!.toLowerCase()
        )
    );
  }

  if (departmentFilter.length > 0) {
    filtered = filtered.filter((p: any) => {
      if (!p.department) return false;

      const productDepartments = Array.isArray(p.department)
        ? p.department
        : [p.department];

      return departmentFilter.some((d) =>
        productDepartments.some(
          (pd: string) => pd.toLowerCase() === d.toLowerCase()
        )
      );
    });
  }

  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  }

  if (search) {
    const keyword = String(search).toLowerCase();

    filtered = filtered.filter((p: any) => {
      const departments = Array.isArray(p.department)
        ? p.department.join(" ").toLowerCase()
        : (p.department || "").toLowerCase();

      return (
        p.name?.toLowerCase().includes(keyword) ||
        p.brand?.toLowerCase().includes(keyword) ||
        p.category?.toLowerCase().includes(keyword) ||
        departments.includes(keyword)
      );
    });
  }

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (sort === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  }

  return filtered;
};

/* =========================
   CONTROLLERS
========================= */

export const getShop = (req: Request, res: Response): void => {
  const products = getAllProducts();
  const filtered = applyFilters(products, req.query);

  res.render("shop", {
    products: filtered,
    allProducts: products,
    query: req.query,
  });
};

export const getProducts = (req: Request, res: Response): void => {
  const products = getAllProducts();

  res.render("shop", {
    products,
    allProducts: products,
    query: req.query,
  });
};

export const getProduct = (req: Request, res: Response): void => {
  const products = getAllProducts();
  const productId = Number(req.params.id);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    res.status(404).send("Product not found");
    return;
  }

  res.render("productDetail", { product });
};

export const filterProducts = (req: Request, res: Response): void => {
  const products = getAllProducts();
  const filtered = applyFilters(products, req.query);
  res.json(filtered);
};

/* =========================
   ADMIN: ADD PRODUCT
========================= */

export const addProduct = (req: Request, res: Response): void => {
  const user = req.session.user;
  if (!user || user.role !== "admin") {
    res.redirect("/");
    return;
  }

  const { name, price, category, brand, description} = req.body;

  const sizes: string[] = req.body.sizes
    ? req.body.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const images: string[] = req.body.images
    ? req.body.images.split(",").map((i: string) => i.trim()).filter(Boolean)
    : [];

  const department: string[] = req.body.department
    ? req.body.department.split(",").map((d: string) => d.trim()).filter(Boolean)
    : [];

  const newProduct: Product = {
    id: Date.now(),
    name,
    price: Number(price),
    category,
    brand,
    sizes,
    images,
    department,
    description,
    isNew: true,
  };

  const products = getAllProducts();
  products.push(newProduct);
  saveProducts(products);

  res.redirect("/products/shop");
};

/* =========================
   ADMIN: DELETE PRODUCT
========================= */

export const deleteProduct = (req: Request, res: Response): void => {
  const user = req.session.user;
  if (!user || user.role !== "admin") {
    res.redirect("/");
    return;
  }

  const products = getAllProducts();
  const id = Number(req.params.id);

  const updated = products.filter((p) => p.id !== id);
  saveProducts(updated);

  res.redirect("/products/shop");
};