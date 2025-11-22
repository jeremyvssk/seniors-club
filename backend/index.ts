dotenv.config();

import express from "express";
import dotenv from "dotenv";

//this might cause some errors.. for somerason it wants me to use SignUp w caps..
import signupRoutes from "./routes/signup.js";
import { PrismaClient } from "@prisma/client";

// app and prisma instances to call for later on
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

//to use the signup.ts
app.use("/routes/signup", signupRoutes);

//what port to use
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
