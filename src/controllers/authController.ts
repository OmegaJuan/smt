import { Request, Response } from "express";
import fs from "fs";
import path from "path";

/* ===== TYPES ===== */
interface Admin {
  id: number;
  username: string;
}

interface User {
  id: number;
  username: string;
}

interface UsersData {
  admin: Admin;
  users: User[];
}

/* ===== DATA PATH ===== */
const usersPath = path.join(process.cwd(), "data", "users.json");

/* ===== HELPERS ===== */
const getUsers = (): UsersData => {
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(
      usersPath,
      JSON.stringify(
        {
          admin: { id: 1, username: "admin" },
          users: [],
        },
        null,
        2
      )
    );
  }

  return JSON.parse(fs.readFileSync(usersPath, "utf-8")) as UsersData;
};

/* =========================
   LOGIN ADMIN
========================= */
export const loginAdmin = (req: Request, res: Response): void => {
  const users = getUsers();

  if (!users.admin) {
    res.redirect("/");
    return;
  }

  req.session.user = {
    id: users.admin.id,
    username: users.admin.username,
    role: "admin",
  };

  req.session.save(() => {
    res.redirect("/");
  });
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = (req: Request, res: Response): void => {
  const { username } = req.body;
  const users = getUsers();

  const user = users.users.find((u) => u.username === username);

  if (!user) {
    res.redirect("/");
    return;
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: "user",
  };

  req.session.save(() => {
    res.redirect("/");
  });
};

/* =========================
          LOGOUT
========================= */
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.redirect("/");
      return;
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};