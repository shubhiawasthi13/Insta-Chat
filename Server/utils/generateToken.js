import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
   user = {
        _id:user._id,
        username:user.username,
        email:user.email,
        profile:user.profile,
        bio:user.bio,
        followers:user.followers,
        following:user.following,
        posts:user.posts
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
