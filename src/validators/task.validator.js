const { body, param } = require("express-validator");

exports.createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("dueDate must be a valid ISO date"),
];

exports.updateTaskValidation = [
  param("id").isMongoId().withMessage("Invalid task id"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("dueDate must be a valid ISO date"),
];

exports.assignTaskValidation = [
  param("id").isMongoId().withMessage("Invalid task id"),
  body("assignedTo")
    .isMongoId()
    .withMessage("assignedTo must be a valid user id"),
];
