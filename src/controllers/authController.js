import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? "admin" : "staff",
  });

  res.status(201).json({
    success: true,
    data: sanitizeUser(user),
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    data: sanitizeUser(user),
    token: generateToken(user._id),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: sanitizeUser(req.user) });
});
