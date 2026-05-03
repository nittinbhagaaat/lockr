const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Saving = require("../models/Saving");
const Goal = require("../models/Goal");

// Helper: get start and end of a month
const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
};

// @route   GET /api/analytics/summary
// Overall totals: income, expenses, savings, net balance
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [incomeResult, expenseResult, savingResult, goals] =
      await Promise.all([
        Income.aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Saving.aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Goal.find({ userId }),
      ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const totalSavings = savingResult[0]?.total || 0;
    const netBalance = totalIncome - totalExpenses - totalSavings;

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const activeGoals = goals.filter((g) => g.status === "active").length;

    res.json({
      totalIncome,
      totalExpenses,
      totalSavings,
      netBalance,
      goals: {
        total: totalGoals,
        active: activeGoals,
        completed: completedGoals,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/monthly?year=2026&month=4
// month is 0-indexed (0 = Jan, 4 = May)
// Returns income, expenses, savings totals + expense breakdown for a specific month
const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month =
      req.query.month !== undefined
        ? parseInt(req.query.month)
        : now.getMonth();

    const { start, end } = getMonthRange(year, month);

    const [
      incomeResult,
      expenseResult,
      savingResult,
      expenseBreakdown,
      incomeBreakdown,
    ] = await Promise.all([
      Income.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Saving.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // Expense breakdown by category
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      // Income breakdown by source
      Income.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$source",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({
      month,
      year,
      totalIncome: incomeResult[0]?.total || 0,
      totalExpenses: expenseResult[0]?.total || 0,
      totalSavings: savingResult[0]?.total || 0,
      expenseBreakdown,
      incomeBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/trend?months=6
// Returns month-by-month income, expense, savings for last N months (for line chart)
const getTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const months = parseInt(req.query.months) || 6;
    const now = new Date();

    const trendData = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const { start, end } = getMonthRange(year, month);

      const [income, expense, saving] = await Promise.all([
        Income.aggregate([
          { $match: { userId, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $match: { userId, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Saving.aggregate([
          { $match: { userId, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      trendData.push({
        month: date.toLocaleString("default", { month: "short" }),
        year,
        income: income[0]?.total || 0,
        expenses: expense[0]?.total || 0,
        savings: saving[0]?.total || 0,
      });
    }

    res.json(trendData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/goals-progress
// Returns all active goals with progress % for progress bars on dashboard
const getGoalsProgress = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user._id,
      status: { $in: ["active", "completed"] },
    }).sort({ createdAt: -1 });

    const result = goals.map((goal) => ({
      _id: goal._id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      remaining: Math.max(goal.targetAmount - goal.savedAmount, 0),
      progressPercent:
        goal.targetAmount > 0
          ? Math.min(
              Math.round((goal.savedAmount / goal.targetAmount) * 100),
              100,
            )
          : 0,
      deadline: goal.deadline,
      status: goal.status,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/recent?limit=10
// Returns recent transactions (expenses + income + savings) merged & sorted by date
const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const [expenses, incomes, savings] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }).limit(limit),
      Income.find({ userId }).sort({ date: -1 }).limit(limit),
      Saving.find({ userId }).sort({ date: -1 }).limit(limit),
    ]);

    // Tag each entry with its type
    const tagged = [
      ...expenses.map((e) => ({ ...e.toObject(), type: "expense" })),
      ...incomes.map((i) => ({ ...i.toObject(), type: "income" })),
      ...savings.map((s) => ({ ...s.toObject(), type: "saving" })),
    ];

    // Sort all by date descending and return top N
    const sorted = tagged
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSummary,
  getMonthlySummary,
  getTrend,
  getGoalsProgress,
  getRecentTransactions,
};
