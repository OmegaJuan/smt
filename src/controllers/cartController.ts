import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Product } from "../models/productModel";

/* =========================
   TYPES
========================= */

interface CartItem {
  productId: string;
  name: string;
  size: string | null;
  quantity: number;
  price: number;
}

interface CartsData {
  [username: string]: CartItem[];
}

/* =========================
   PATHS
========================= */

const cartsPath = path.join(process.cwd(), "data", "carts.json");
const productsPath = path.join(process.cwd(), "data", "products.json");

/* =========================
   HELPERS
========================= */

const getCarts = (): CartsData => {
  if (!fs.existsSync(cartsPath)) {
    fs.writeFileSync(cartsPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(cartsPath, "utf-8")) as CartsData;
};

const saveCarts = (carts: CartsData): void => {
  fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
};

const getProducts = (): Product[] => {
  if (!fs.existsSync(productsPath)) {
    fs.writeFileSync(productsPath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(productsPath, "utf-8")) as Product[];
};

const isUser = (req: Request): boolean => {
  return !!req.session.user && req.session.user.role === "user";
};

/* =========================
  ADD TO CART
========================= */

export const addToCart = (req: Request, res: Response): void => {
  if (!isUser(req)) {
    res.status(401).json({ success: false });
    return;
  }

  const username = req.session.user!.username;
  const productId = req.params.id as string;
  const size = req.body.size || null;
  const quantity = Math.max(1, Number(req.body.quantity) || 1);

  const carts = getCarts();
  const products = getProducts();

  const product = products.find(
    (p) => String(p.id) === String(productId)
  );

  if (!product) {
    res.status(404).json({ success: false });
    return;
  }

  if (!carts[username]) carts[username] = [];

  const userCart = carts[username];

  const existingItem = userCart.find(
    (item) =>
      String(item.productId) === String(productId) &&
      item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.push({
      productId,
      name: product.name,
      size,
      quantity,
      price: product.price
    });
  }

  saveCarts(carts);

  /* count total items */

  const cartCount = userCart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (req.headers.accept?.includes("application/json")) {
    res.json({
      success: true,
      cartCount
    });
  } else {
    res.redirect("/wishlist");
  }
};

/* =========================
  VIEW CART
========================= */

export const viewCart = (req: Request, res: Response): void => {
  if (!isUser(req)) {
    res.redirect("/login");
    return;
  }

  const username = req.session.user!.username;
  const carts = getCarts();
  const products = getProducts();

  const userCart = carts[username] || [];

  const detailedCart = userCart
    .map((item) => {
      const product = products.find(
        (p) => String(p.id) === String(item.productId)
      );

      if (!product) return null;

      return { ...item, product };
    })
    .filter(Boolean) as (CartItem & { product: Product })[];

  const grandTotal = detailedCart.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  res.render("cart", {
    cart: detailedCart,
    grandTotal,
  });
};

/* =========================
  INCREASE QTY
========================= */

export const increaseQty = (req: Request, res: Response): void => {
  if (!isUser(req)) {
    res.json({ success: false });
    return;
  }

  const username = req.session.user!.username;
  const productId = req.params.id;
  const size = req.body.size || null;

  const carts = getCarts();
  const userCart = carts[username] || [];

  const item = userCart.find(
    (i) =>
      String(i.productId) === String(productId) &&
      i.size === size
  );

  if (item) {
    item.quantity += 1;
    saveCarts(carts);
  }

  res.json({ success: true });
};

/* =========================
  DECREASE QTY
========================= */

export const decreaseQty = (req: Request, res: Response): void => {
  if (!isUser(req)) {
    res.json({ success: false });
    return;
  }

  const username = req.session.user!.username;
  const productId = req.params.id;
  const size = req.body.size || null;

  const carts = getCarts();
  const userCart = carts[username] || [];

  const item = userCart.find(
    (i) =>
      String(i.productId) === String(productId) &&
      i.size === size
  );

  if (item) {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      carts[username] = userCart.filter(
        (i) =>
          !(
            String(i.productId) === String(productId) &&
            i.size === size
          )
      );
    }

    saveCarts(carts);
  }

  res.json({ success: true });
};

/* =========================
  REMOVE ITEM
========================= */

export const removeItem = (req: Request, res: Response): void => {
  if (!isUser(req)) {
    res.json({ success: false });
    return;
  }

  const username = req.session.user!.username;
  const productId = req.params.id;
  const size = req.body.size || null;

  const carts = getCarts();
  const userCart = carts[username] || [];

  carts[username] = userCart.filter(
    (item) =>
      !(
        String(item.productId) === String(productId) &&
        item.size === size
      )
  );

  saveCarts(carts);

  res.json({ success: true });
};