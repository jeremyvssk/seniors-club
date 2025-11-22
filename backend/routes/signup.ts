import type { Request, Response } from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

//create a router and prisma client to use
const router = Router();
const prisma = new PrismaClient();

//what needs to be in the submit when signing up
router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //to make sure both are submitted
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  //existing user if email is already in use. checks if its exisiting user
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    //if not, creates a new user - this is where we add password crypts I think
    const newUser = await prisma.user.create({
      data: { email, password },
    });

    //user created messaged
    return res
      .status(201)
      .json({ message: "Congratiolations! User created.", userId: newUser.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
