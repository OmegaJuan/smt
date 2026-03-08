import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const cartsPath = path.join(process.cwd(), "data", "carts.json");
const ordersPath = path.join(process.cwd(), "data", "orders.json");

/* =========================
   HELPERS
========================= */

const getCarts = () => {
    return JSON.parse(fs.readFileSync(cartsPath, "utf-8"));
};

const saveCarts = (carts: any) => {
    fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
};

const getOrders = () => {
    return JSON.parse(fs.readFileSync(ordersPath, "utf-8"));
};

const saveOrders = (orders: any) => {
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
};

/* =========================
   VIEW CHECKOUT PAGE
========================= */

export const viewCheckout = (req: Request, res: Response) => {

    const user = req.session.user!;
    const username = user.username;

    const carts = getCarts();
    const userCart = carts[username] || [];

    res.render("checkout", {
        cart: userCart
    });

};

/* =========================
   PLACE ORDER
========================= */

export const placeOrder = (req: Request, res: Response) => {

    const user = req.session.user!;
    const username = user.username;

    const { name, address, phone, payment } = req.body;

    const carts = getCarts();
    const orders = getOrders();

    const userCart = carts[username] || [];

    const orderTotal = userCart.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    const newOrder = {
        id: "order_" + Date.now(),
        userId: user.id,
        username,
        items: userCart,
        name,
        address,
        phone,
        payment,
        total: orderTotal,
        status: "Pending",
        date: new Date().toISOString()
    };

    orders.push(newOrder);

    /* REMOVE CART AFTER CHECKOUT */

    carts[username] = [];

    saveOrders(orders);
    saveCarts(carts);

    res.render("orderSuccess");

};

/* =========================
   ADMIN ORDER LIST
========================= */

export const viewAdminOrders = (req: Request, res: Response) => {

    const orders = getOrders();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.total || 0),
        0
    );

    const pendingOrders = orders.filter(
        (o: any) => o.status === "Pending"
    ).length;

    const deliveredOrders = orders.filter(
        (o: any) => o.status === "Delivered"
    ).length;

    res.render("adminOrders", {
        orders,
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders
    });

};

export const updateOrderStatus = (req: Request, res: Response) => {

    const { id } = req.params;
    const { status } = req.body;

    const orders = getOrders();

    const order = orders.find((o: any) => o.id === id);

    if (order) {
        order.status = status;
    }

    saveOrders(orders);

    res.redirect("/admin/orders");

};

/* =========================
   USER ORDER (ดูของตัวเอง)
========================= */
export const viewUserOrders = (req: Request, res: Response) => {

    const user = req.session.user;

    if (!user) {
        return res.redirect("/");
    }

    const orders = getOrders();

    const userOrders = orders.filter(
        (o: any) => o.userId === user.id
    );

    res.render("myOrders", {
        orders: userOrders,
        user
    });

};