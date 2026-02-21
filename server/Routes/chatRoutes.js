import express from "express";
import { chatWithAI } from "../Controllers/chatController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",protect, chatWithAI);

export default router;
