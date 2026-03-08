import { Router } from "express";
import {
   viewCheckout,
   placeOrder,
   viewAdminOrders,
   updateOrderStatus,
   viewUserOrders
} from "../controllers/orderController";

import isUser from "../middleware/isUser";
import isAdmin from "../middleware/isAdmin";

const router = Router();

/* =========================
   USER CHECKOUT PAGE
========================= */

router.get("/checkout", isUser, viewCheckout);



/* =========================
   PLACE ORDER
========================= */

router.post("/checkout", isUser, placeOrder);

/* =========================
   USER ORDER HISTORY
========================= */

router.get("/my-orders", isUser, viewUserOrders);

/* =========================
   ADMIN ORDER LIST
========================= */

router.get("/admin/orders", isAdmin, viewAdminOrders);
router.post("/admin/orders/:id/status", isAdmin, updateOrderStatus);

// Usr order success

router.get("/orderSuccess", (req, res) => {
  res.render("orderSuccess");
});


export default router;