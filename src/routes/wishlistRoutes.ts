import express from "express";
import { addToWishlist, viewWishlist, removeFromWishlist } from "../controllers/wishlistController";

const router = express.Router();

router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);
router.get("/", viewWishlist);

export default router;