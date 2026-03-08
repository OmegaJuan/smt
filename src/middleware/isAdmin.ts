import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.user || req.session.user.role !== "admin") {
    res.redirect("/");
    return;
  }

  next();
};

export default isAdmin;