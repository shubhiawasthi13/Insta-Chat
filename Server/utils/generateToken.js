import jwt from "jsonwebtoken";
import { Post } from "../modals/post.model";

export const generateToken = (res, user, message) => {
  const populatedPost = Promise.all(
    user.posts.map(async(postId)=>{
      const post  = await Post.findById(postId);
      if(post.author.equals(user._id)){
        return post;
      }
      return null;
    })
  )
   user = {
        _id:user._id,
        username:user.username,
        email:user.email,
        profile:user.profile,
        bio:user.bio,
        followers:user.followers,
        following:user.following,
        posts:populatedPost
    }
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
      token, // ✅ for mobile apps to use in header
    });
};
