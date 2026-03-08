import { Request, Response } from "express";
import * as productModel from "../models/productModel";

export const getHome = (req: Request, res: Response): void => {
  const allProducts = productModel.getAllProducts();

  // เอาเฉพาะสินค้าที่เป็น New
  const newProducts = allProducts.filter(
    (product) => product.isNew === true
  );

  res.render("home", {
    products: newProducts,
    user: req.session.user || null,
  });
};