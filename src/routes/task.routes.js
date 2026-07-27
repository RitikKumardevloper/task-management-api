const express = require("express");
const {
  createTask,
  getTasks,
  getAssignedTasks,
  updateTask,
  deleteTask,
  assignTask,
  getAnalytics,
} = require("../controllers/task.controllers");
const validate = require("../middleware/validation.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createTaskValidation,
  updateTaskValidation,
  assignTaskValidation,
} = require("../validators/task.validator");

const router = express.Router();

router.post(
  "/createtask",
  authenticate,
  createTaskValidation,
  validate,
  createTask,
);
router.get("/alltasks", authenticate, getTasks);
router.get("/assigned", authenticate, getAssignedTasks);
router.put("/:id", authenticate, updateTaskValidation, validate, updateTask);
router.delete("/:id", authenticate, deleteTask);
router.patch(
  "/:id/assign",
  authenticate,
  authorize("manager", "admin"),
  assignTaskValidation,
  validate,
  assignTask,
);
router.get("/analytics", authenticate, getAnalytics);

module.exports = router;
