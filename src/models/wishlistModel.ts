import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "wishlists.json");

export interface WishlistItem {
    userId: number;
    productId: number;
    name?: string;
    price?: number;
    size?: string | null;
}

export const getWishlists = (): WishlistItem[] => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
};

export const saveWishlists = (wishlists: WishlistItem[]) => {
    fs.writeFileSync(filePath, JSON.stringify(wishlists, null, 2));
};