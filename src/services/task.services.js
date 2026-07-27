const Task = require("../model/Task");
const User = require("../model/User");
const { getIO } = require("../socket");

const populateTask = (query) =>
  query
    .populate("assignedTo", "username email role team")
    .populate("createdBy", "username email role team");

const createTask = async (taskData, userId) => {
  const { title, description, status, priority, dueDate, assignedTo } =
    taskData;
  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    assignedTo: assignedTo || null,
    createdBy: userId,
  });

  const createdTask = await populateTask(Task.findById(task._id));
  const io = getIO();
  if (io) {
    io.emit("task-created", createdTask);
  }
  return createdTask;
};

const getTasks = async ({ user, filters = {} }) => {
  const currentUser = await User.findById(user.id);
  let query = {};

  if (user.role === "user") {
    query.$or = [{ createdBy: user.id }, { assignedTo: user.id }];
  } else if (user.role === "manager") {
    const teamUsers = await User.find({
      team: currentUser?.team || "default",
    }).select("_id");
    const teamUserIds = teamUsers.map((entry) => entry._id);
    query.$or = [
      { createdBy: user.id },
      { assignedTo: user.id },
      { createdBy: { $in: teamUserIds } },
      { assignedTo: { $in: teamUserIds } },
    ];
  }

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const sortField = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    populateTask(
      Task.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
    ),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getAssignedTasks = async (userId) => {
  return populateTask(Task.find({ assignedTo: userId })).sort({
    createdAt: -1,
  });
};

const updateTask = async (taskId, updates, currentUser) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (currentUser.role === "admin") {
    // admin can update anything
  } else if (currentUser.role === "manager") {
    const manager = await User.findById(currentUser.id);
    const creator = await User.findById(task.createdBy);
    const assignee = task.assignedTo
      ? await User.findById(task.assignedTo)
      : null;
    const isTeamTask =
      (creator?.team && creator.team === manager?.team) ||
      (assignee?.team && assignee.team === manager?.team);

    if (!isTeamTask) {
      throw new Error("Managers can only update tasks within their team");
    }
  } else if (String(task.createdBy) !== String(currentUser.id)) {
    throw new Error("You can only update tasks you created");
  }

  Object.assign(task, updates);
  await task.save();

  const updatedTask = await populateTask(Task.findById(task._id));
  const io = getIO();
  if (io) {
    io.emit("task-updated", updatedTask);
  }
  return updatedTask;
};

const deleteTask = async (taskId, currentUser) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (currentUser.role === "admin") {
    // admin can delete anything
  } else if (currentUser.role === "manager") {
    const manager = await User.findById(currentUser.id);
    const creator = await User.findById(task.createdBy);
    const assignee = task.assignedTo
      ? await User.findById(task.assignedTo)
      : null;
    const isTeamTask =
      (creator?.team && creator.team === manager?.team) ||
      (assignee?.team && assignee.team === manager?.team);

    if (!isTeamTask) {
      throw new Error("Managers can only delete tasks within their team");
    }
  } else if (String(task.createdBy) !== String(currentUser.id)) {
    throw new Error("You can only delete tasks you created");
  }

  await task.deleteOne();
  const io = getIO();
  if (io) {
    io.emit("task-deleted", { taskId });
  }
};

const assignTask = async (taskId, assignedTo, currentUser) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (currentUser.role === "user") {
    throw new Error("Only managers/admins can assign tasks");
  }

  const targetUser = await User.findById(assignedTo);
  if (!targetUser) throw new Error("Assigned user not found");

  if (currentUser.role === "manager") {
    const manager = await User.findById(currentUser.id);
    if (manager?.team !== targetUser.team) {
      throw new Error("Managers can only assign tasks within their team");
    }
  }

  task.assignedTo = assignedTo;
  await task.save();

  const assignedTask = await populateTask(Task.findById(task._id));
  const io = getIO();
  if (io) {
    io.emit("task-assigned", assignedTask);
  }
  return assignedTask;
};

const getAnalytics = async (currentUser) => {
  const query =
    currentUser.role === "user" ? { createdBy: currentUser.id } : {};
  const counts = await Task.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const overdue = await Task.countDocuments({
    ...query,
    dueDate: { $lt: new Date() },
    status: { $ne: "Completed" },
  });

  return {
    counts: counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    overdue,
  };
};

module.exports = {
  createTask,
  getTasks,
  getAssignedTasks,
  updateTask,
  deleteTask,
  assignTask,
  getAnalytics,
};
