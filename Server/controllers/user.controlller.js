import { User } from "../modals/user.modal.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { Post } from "../modals/post.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "user already exist.",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashPassword,
    });
    return res.status(201).json({
      success: true,
      message: "Account Created Sucessfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to register.",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "incorrect email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "incorrect email or password",
      });
    }
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "failed to login.",
    });
  }
};

export const logOut = async (_, res) => {
  try {
    return res
      .clearCookie("token", {
        httpOnly: true,
        secure: true,         // ✅ Required for HTTPS (Render)
        sameSite: "None",     // ✅ Required for cross-site cookie removal
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully.",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in logout.",
    });
  }
};
