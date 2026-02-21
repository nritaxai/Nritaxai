import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js"
import authRoute from "./Routes/authRoutes.js";
import chatRoute from "./Routes/chatRoutes.js";
import subscriptionRoute from "./Routes/subscriptionRoutes.js";
import calculatorRoute from "./Routes/calculatorRoutes.js";
import webhookRoute from "./Routes/webhookRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      if (
        req.originalUrl.startsWith("/api/subscription/razorpay-webhook") ||
        req.originalUrl.startsWith("/razorpay/webhook")
      ) {
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nritaxai-cw9w.vercel.app",
      "https://nritax.ai",
      "https://www.nritax.ai",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/calculator", calculatorRoute);
app.use("/razorpay", webhookRoute);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
