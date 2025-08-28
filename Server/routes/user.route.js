import express from "express";
import {
  register,
  login,
  logOut,
  getProfile,
  updateProfile,
  getSuggestedUsers,
  followOrUnfollow,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logOut);

// Profile routes
router.get("/profile/:id", isAuthenticated, getProfile);
router.post("/profile/update", isAuthenticated, upload.single("profile"), updateProfile);

// Suggested users
router.get("/suggested", isAuthenticated, getSuggestedUsers);

// Follow/Unfollow
router.post("/follow-unfollow/:id", isAuthenticated, followOrUnfollow);

export default router;
