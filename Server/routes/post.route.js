import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, likePost } from "../controllers/post.controller.js";


const router = express.Router();

// Auth routes
router.post("/allpost", isAuthenticated, upload.single("profile"), addNewPost);
router.get("/allpost", isAuthenticated, getAllPost);
router.get("/userpost/all", isAuthenticated, getUserPost);
router.post("/likepost/:id", isAuthenticated, likePost);
router.post("/dislikepost/:id", isAuthenticated, dislikePost);
router.post("/comment/:id", isAuthenticated, addComment);
router.get("/allcomment/:id", isAuthenticated, getCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.post("/bookmark/:id", isAuthenticated, bookmarkPost);


export default router;