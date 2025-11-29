import type { Request, Response } from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/jwt.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  // extract email and password from body (incoming frontend data request)
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // searches db for user with matching email
    const user = await prisma.user.findUnique({ where: { email } });
    // if no user match or password doesn't match -> invalid credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // login successful: now generate access token -> use generateAccessToken function from jwt.ts for it
    const token = generateAccessToken({ userId: user.id, email: user.email });
    // send back to frontend
    return res.json({ 
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;