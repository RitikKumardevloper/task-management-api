const { body } = require("express-validator");
const { isStrongPassword, isValidEmail } = require("../utils/validation");

exports.registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error("Please provide a valid email address");
      }
      return true;
    }),
  body("password").custom((value) => {
    if (!isStrongPassword(value)) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      );
    }
    return true;
  }),
  body("role")
    .optional()
    .isIn(["user", "admin", "manager"])
    .withMessage("Role must be user, manager, or admin"),
];

exports.loginValidation = [
  body("identifier")
    .optional({ values: "falsy" })
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Identifier is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("username")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password").notEmpty().withMessage("Password is required"),
];
