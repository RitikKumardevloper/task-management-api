const express = require("express");
const {
  register,
  login,
  logout,
  getProfile,
  getUsers,
} = require("../controllers/auth.controllers");
const {
  registerValidation,
  loginValidation,
} = require("../validators/auth.validator");
const validate = require("../middleware/validation.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, authorize("admin", "manager"), getUsers);

module.exports = router;
