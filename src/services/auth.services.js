const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("./notification.service");

const registerUser = async (userData) => {
  const { username, email, password, role, team } = userData;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new Error("Username already exists");
  }

  const emailExists = await User.findOne({ email: normalizedEmail });
  if (emailExists) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: normalizedEmail,
    password: hashedPassword,
    role: role || "user",
    team: team || "default",
  });

  try {
    await sendWelcomeEmail({ email: user.email, username: user.username });
  } catch (error) {
    // Swallow notification failures so registration still succeeds.
  }

  return user;
};

const loginUser = async ({ identifier, email, username, password }) => {
  const emailValue = email ? String(email).trim().toLowerCase() : "";
  const usernameValue = username ? String(username).trim() : "";
  const identifierValue = identifier ? String(identifier).trim() : "";

  const query = identifierValue
    ? {
        $or: [
          { email: identifierValue.toLowerCase() },
          { username: identifierValue },
        ],
      }
    : emailValue
      ? { email: emailValue }
      : { username: usernameValue };

  const user = await User.findOne(query);
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

  return { user, token };
};

const getUserProfile = async (userId) => {
  return User.findById(userId).select("-password");
};

const getAllUsers = async (currentUser = null) => {
  const query =
    currentUser?.role === "manager"
      ? { team: currentUser.team || "default" }
      : {};

  return User.find(query).select("-password");
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
};
