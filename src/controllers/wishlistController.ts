import { Request, Response } from "express";
import { getWishlists, saveWishlists } from "../models/wishlistModel";
import fs from "fs";
import path from "path";

/* ===== PRODUCTS DATA ===== */
const productsPath = path.join(process.cwd(), "data", "products.json");

const getProducts = () => {
    return JSON.parse(fs.readFileSync(productsPath, "utf-8"));
};

/* =========================
        ADD WISHLIST
========================= */
/* =========================
        ADD WISHLIST
========================= */
export const addToWishlist = (req: Request, res: Response) => {

    const user = req.session.user;

    /* allow only normal user */

    if (!user || user.role !== "user") {
        return res.redirect("/");
    }

    const productId = Number(req.body.productId);
    const size = req.body.size || null;

    const wishlists = getWishlists();
    const products = getProducts();

    const product = products.find((p: any) => p.id === productId);

    const exists = wishlists.find(
        (w) =>
            w.userId === user.id &&
            w.productId === productId &&
            (w.size || null) === (size || null)
    );

    if (!exists) {

        wishlists.push({
            userId: user.id,
            productId: productId,
            name: product?.name,
            price: product?.price,
            size: size
        });

        saveWishlists(wishlists);
    }

    res.redirect(req.get("Referrer") || "/");
};

/* =========================
        REMOVE WISHLIST
========================= */
export const removeFromWishlist = (req: Request, res: Response) => {

    const user = req.session.user;

    if (!user || user.role === "admin") {
        return res.redirect("/");
    }

    const productId = Number(req.body.productId);
    const size = req.body.size || null;

    let wishlists = getWishlists();

    wishlists = wishlists.filter(
        (w) =>
            !(
                w.userId === user.id &&
                w.productId === productId &&
                (w.size || null) === (size || null)
            )
    );

    saveWishlists(wishlists);

    res.redirect("/wishlist");
};

/* =========================
        VIEW WISHLIST
========================= */
export const viewWishlist = (req: Request, res: Response) => {

    const user = req.session.user;

    if (!user || user.role === "admin") {
        return res.redirect("/");
    }

    const wishlists = getWishlists();
    const products = getProducts();

    const userWishlist = wishlists
        .filter((w) => w.userId === user.id)
        .map((w) => {

            const product = products.find((p: any) => p.id === w.productId);

            if (!product) return null;

            return {
                ...product,
                selectedSize: w.size
            };

        })
        .filter(Boolean);

    res.render("wishlist", {
        wishlist: userWishlist,
        user: user,
    });
};