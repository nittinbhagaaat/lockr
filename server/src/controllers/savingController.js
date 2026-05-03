const Saving = require("../models/Saving");
const Goal = require("../models/Goal");

// @route   POST /api/savings
const addSaving = async (req, res) => {
  try {
    const { amount, label, goalId, date } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // If goalId is provided, verify it belongs to this user
    if (goalId) {
      const goal = await Goal.findById(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      if (goal.userId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to save to this goal" });
      }
      if (goal.status === "completed") {
        return res
          .status(400)
          .json({ message: "This goal is already completed" });
      }
      if (goal.status === "abandoned") {
        return res
          .status(400)
          .json({ message: "Cannot save to an abandoned goal" });
      }
    }

    const saving = await Saving.create({
      userId: req.user._id,
      amount,
      label: label || "General Savings",
      goalId: goalId || null,
      date: date || Date.now(),
    });

    // Populate goal info if linked
    const populated = await Saving.findById(saving._id).populate(
      "goalId",
      "name targetAmount savedAmount status",
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/savings
// Supports query params: ?goalId=<id>&type=general|goal
const getSavings = async (req, res) => {
  try {
    const { goalId, type, startDate, endDate } = req.query;

    const filter = { userId: req.user._id };

    if (goalId) filter.goalId = goalId;

    // type=general → no goal linked, type=goal → has a goal linked
    if (type === "general") filter.goalId = null;
    if (type === "goal") filter.goalId = { $ne: null };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const savings = await Saving.find(filter)
      .populate("goalId", "name targetAmount savedAmount status")
      .sort({ date: -1 });

    res.json(savings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/savings/total
// Returns total general savings + total goal-linked savings + grand total
const getSavingsTotal = async (req, res) => {
  try {
    const result = await Saving.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$goalId", null] }, "general", "goal"] },
          total: { $sum: "$amount" },
        },
      },
    ]);

    let generalTotal = 0;
    let goalTotal = 0;

    result.forEach((item) => {
      if (item._id === "general") generalTotal = item.total;
      if (item._id === "goal") goalTotal = item.total;
    });

    res.json({
      generalSavings: generalTotal,
      goalSavings: goalTotal,
      grandTotal: generalTotal + goalTotal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/savings/:id
const getSavingById = async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id).populate(
      "goalId",
      "name targetAmount savedAmount status",
    );

    if (!saving) {
      return res.status(404).json({ message: "Saving not found" });
    }

    if (saving.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(saving);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/savings/:id
const updateSaving = async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ message: "Saving not found" });
    }

    if (saving.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { amount, label, date } = req.body;
    // Note: goalId is intentionally not updatable to avoid
    // inconsistent goal savedAmount calculations. Delete and re-add instead.

    saving.amount = amount ?? saving.amount;
    saving.label = label ?? saving.label;
    saving.date = date ?? saving.date;

    const updated = await saving.save(); // triggers post('save') hook → recalculates goal

    const populated = await Saving.findById(updated._id).populate(
      "goalId",
      "name targetAmount savedAmount status",
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/savings/:id
const deleteSaving = async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ message: "Saving not found" });
    }

    if (saving.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const linkedGoalId = saving.goalId;
    await saving.deleteOne();

    // Manually recalculate goal savedAmount after deletion
    if (linkedGoalId) {
      const totalSaved = await Saving.aggregate([
        { $match: { goalId: linkedGoalId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const total = totalSaved[0]?.total || 0;
      const goal = await Goal.findById(linkedGoalId);

      if (goal) {
        goal.savedAmount = total;
        // Revert to active if it was completed and savings dropped
        if (goal.status === "completed" && total < goal.targetAmount) {
          goal.status = "active";
        }
        await goal.save();
      }
    }

    res.json({ message: "Saving deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSaving,
  getSavings,
  getSavingsTotal,
  getSavingById,
  updateSaving,
  deleteSaving,
};
