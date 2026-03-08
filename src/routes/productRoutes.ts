import { Router } from "express";
import * as productController from "../controllers/productController";
import isAdmin from "../middleware/isAdmin";

const router = Router();

/* =========================
   SHOP PAGE
========================= */
router.get("/shop", productController.getShop);

/* =========================
   PRODUCT DETAIL
========================= */
router.get("/:id", productController.getProduct);

/* =========================
   AJAX FILTER
========================= */
router.get("/shop/filter", productController.filterProducts);

/* =========================
   ADMIN
========================= */
router.post(
   "/admin/add",
   isAdmin,
   productController.addProduct
);

router.post(
   "/admin/delete/:id",
   isAdmin,
   productController.deleteProduct
);

export default router;