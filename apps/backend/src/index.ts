import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from TrustLens-AI backend 🚀" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
