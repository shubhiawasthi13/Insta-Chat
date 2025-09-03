import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../modals/post.model.js";
import { User } from "../modals/user.model.js";
import { Comment } from "../modals/comment.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image required.",
      });
    }
    // image upload
    const optmizeImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();
    // buffer to data uri
    const fileUri = `data:image/jpeg;base64,${optmizeImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      success: true,
      message: "Post Created Sucessfully.",
      post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username, profile" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username, profile",
        },
      });
    return res.status(201).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profile",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profile",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await post.updateOne({
      $addToSet: { likes: likeKrneWalaUserKiId },
    });
    await post.save();

    return res.status(200).json({
      message: "Post Liked",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await post.updateOne({
      $pull: { likes: likeKrneWalaUserKiId },
    });
    await post.save();

    return res.status(200).json({
      message: "Post Disliked",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKarneVala = req.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (!text) {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    const comment = await Comment.create({
      text,
      author: commentKarneVala,
      post: postId,
    });

    // populate comment author details
    await comment.populate({
      path: "author",
      select: "username profile",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(200).json({
      message: "Comment added successfully",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username profile"
    );

    if (!comments || comments.length === 0) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if logged-in user is the owner
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Remove post id from user's posts
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    // Delete post and its comments
    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

//  Bookmark / Unbookmark Post
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const user = await User.findById(authorId);

    if (user.bookmarks.includes(postId)) {
      // 🔹 Remove from bookmarks
      await user.updateOne({ $pull: { bookmarks: postId } });
      await user.save();

      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmarks",
        success: true,
      });
    } else {
      // 🔹 Add to bookmarks
      await user.updateOne({ $addToSet: { bookmarks: postId } });
      await user.save();

      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
