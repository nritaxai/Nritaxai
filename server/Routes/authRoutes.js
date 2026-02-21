import express from 'express';
import {
  changePassword,
  deleteAccount,
  getUserProfile,
  googleLogin,
  loginUser, registerUser,
  updateUserProfile
} from '../Controllers/authController.js';
import { protect } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post("/login", loginUser);

router.post("/google-login", googleLogin);

router.get("/profile", protect, getUserProfile);

router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

router.delete("/delete-account", protect, deleteAccount);

export default router;