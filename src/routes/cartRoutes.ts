import { Router } from "express";
import {
  viewCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
} from "../controllers/cartController";
import isUser from "../middleware/isUser";

const router = Router();

/* =========================
   VIEW CART
========================= */

router.get("/", isUser, viewCart);

/* =========================
   ADD TO CART
========================= */

router.post("/add/:id", isUser, addToCart);

/* =========================
   INCREASE QTY
========================= */

router.post("/increase/:id", isUser, increaseQty);

/* =========================
   DECREASE QTY
========================= */

router.post("/decrease/:id", isUser, decreaseQty);

/* =========================
   REMOVE ITEM
========================= */

router.post("/remove/:id", isUser, removeItem);

export default router;