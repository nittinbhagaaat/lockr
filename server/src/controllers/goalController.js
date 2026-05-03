const Goal = require("../models/Goal");
const Saving = require("../models/Saving");

// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, description } = req.body;

    if (!name || !targetAmount) {
      return res
        .status(400)
        .json({ message: "Name and target amount are required" });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      name,
      targetAmount,
      savedAmount: 0,
      deadline: deadline || null,
      description: description || "",
      status: "active",
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/goals
// Supports query params: ?status=active|completed|abandoned
const getGoals = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    // Attach progress percentage to each goal
    const goalsWithProgress = goals.map((goal) => {
      const g = goal.toObject();
      g.progressPercent =
        goal.targetAmount > 0
          ? Math.min(
              Math.round((goal.savedAmount / goal.targetAmount) * 100),
              100,
            )
          : 0;
      return g;
    });

    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/goals/:id
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const g = goal.toObject();
    g.progressPercent =
      goal.targetAmount > 0
        ? Math.min(
            Math.round((goal.savedAmount / goal.targetAmount) * 100),
            100,
          )
        : 0;
    g.remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

    res.json(g);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, targetAmount, deadline, description, status } = req.body;

    goal.name = name ?? goal.name;
    goal.targetAmount = targetAmount ?? goal.targetAmount;
    goal.deadline = deadline !== undefined ? deadline : goal.deadline;
    goal.description = description ?? goal.description;

    // Allow manual status update (e.g. abandon a goal)
    if (status && ["active", "completed", "abandoned"].includes(status)) {
      goal.status = status;
    }

    // Auto-check completion if targetAmount was updated
    if (targetAmount && goal.savedAmount >= goal.targetAmount) {
      goal.status = "completed";
    }

    const updated = await goal.save();

    const g = updated.toObject();
    g.progressPercent =
      updated.targetAmount > 0
        ? Math.min(
            Math.round((updated.savedAmount / updated.targetAmount) * 100),
            100,
          )
        : 0;
    g.remaining = Math.max(updated.targetAmount - updated.savedAmount, 0);

    res.json(g);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Unlink all savings that were tied to this goal (convert to general savings)
    await Saving.updateMany(
      { goalId: goal._id },
      { $set: { goalId: null, label: `(Unlinked from: ${goal.name})` } },
    );

    await goal.deleteOne();

    res.json({
      message:
        "Goal deleted. Linked savings have been moved to general savings.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/goals/:id/savings
// Get all savings entries linked to a specific goal
const getGoalSavings = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const savings = await Saving.find({
      goalId: req.params.id,
      userId: req.user._id,
    }).sort({ date: -1 });

    res.json({
      goal: {
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        progressPercent: Math.min(
          Math.round((goal.savedAmount / goal.targetAmount) * 100),
          100,
        ),
        remaining: Math.max(goal.targetAmount - goal.savedAmount, 0),
        status: goal.status,
        deadline: goal.deadline,
      },
      savings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalSavings,
};
