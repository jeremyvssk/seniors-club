import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import signupRoutes from "./routes/signup.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// app and prisma instances to call for later on
const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

//to use the signup.ts
app.use("/api/signup", signupRoutes);

//what port to use
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
