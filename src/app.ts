import fs from "fs";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";

import homeRoutes from "./routes/homeRoutes";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();
const PORT: number = 3000;

/* =========================
   ROOT PATH
========================= */

const rootPath = process.cwd();

/* =========================
   VIEW ENGINE
========================= */

app.set("view engine", "ejs");
app.set("views", path.join(rootPath, "views"));

/* =========================
   STATIC FILES
========================= */

app.use(express.static(path.join(rootPath, "public")));

/* =========================
   BODY PARSER (สำคัญมาก)
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SESSION
========================= */

app.use(
   session({
      secret: "verysecretkey",
      resave: false,
      saveUninitialized: false,
      cookie: {
         secure: false,
         httpOnly: true,
         sameSite: "lax",
      },
   })
);

/* =========================
   GLOBAL EJS VARIABLES
========================= */

app.use((req: Request, res: Response, next: NextFunction) => {
   res.locals.user = req.session.user || null;
   res.locals.query = req.query || {};
   next();
});

/* =========================
   CART COUNT
========================= */

app.use((req: Request, res: Response, next: NextFunction) => {
   let cartCount = 0;

   try {
      if (req.session.user) {
         const cartsPath = path.join(rootPath, "data", "carts.json");

         if (fs.existsSync(cartsPath)) {
            const carts = JSON.parse(fs.readFileSync(cartsPath, "utf-8"));

            const username = req.session.user.username;

            const userCart = carts[username] || [];

            cartCount = userCart.reduce(
               (total: number, item: any) => total + item.quantity,
               0
            );
         }
      }
   } catch (error) {
      console.error("Cart count error:", error);
   }

   res.locals.cartCount = cartCount;

   next();
});

/* =========================
   ROUTES
========================= */

app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/orders", orderRoutes);

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(
   (err: any, req: Request, res: Response, next: NextFunction) => {
      console.error("Server Error:", err);

      if (req.headers.accept?.includes("application/json")) {
         return res.status(500).json({
            success: false,
            message: "Internal Server Error",
         });
      }

      res.status(500).send("Internal Server Error");
   }
);

/* =========================
   SERVER
========================= */

app.listen(PORT, (): void => {
   console.log(`Server running on http://localhost:${PORT}`);
});