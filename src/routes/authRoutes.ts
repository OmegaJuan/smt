import { Router } from "express";
import {
  loginAdmin,
  loginUser,
  logout,
} from "../controllers/authController";

const router = Router();

/* LOGIN */
router.post("/login/admin", loginAdmin);
router.post("/login/user", loginUser);

/* LOGOUT */
router.post("/logout", logout);

export default router;