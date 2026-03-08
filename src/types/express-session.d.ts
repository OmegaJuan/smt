import "express-session";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      role: "admin" | "user";
    };
    cart?: CartItem[];
  }
}