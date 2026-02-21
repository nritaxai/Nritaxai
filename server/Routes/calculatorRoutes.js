import express from "express";
import {
  calculateCapitalGainsTax,
  calculateIncomeTax,
  calculateRentalIncomeTax,
} from "../Controllers/calculatorController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/income-tax", protect, calculateIncomeTax);
router.post("/capital-gains-tax", protect, calculateCapitalGainsTax);
router.post("/rental-income-tax", protect, calculateRentalIncomeTax);

export default router;
