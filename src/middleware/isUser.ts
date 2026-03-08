import { Request, Response, NextFunction } from "express";

const isUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.user || req.session.user.role !== "user") {
    res.redirect("/");
    return;
  }

  next();
};

export default isUser;