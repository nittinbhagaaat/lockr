const Income = require("../models/Income");

// @route   POST /api/income
const addIncome = async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;

    if (!amount || !source) {
      return res
        .status(400)
        .json({ message: "Amount and source are required" });
    }

    const income = await Income.create({
      userId: req.user._id,
      amount,
      source,
      description: description || "",
      date: date || Date.now(),
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/income
// Supports query params: ?source=Salary&startDate=2026-05-01&endDate=2026-05-31
const getIncomes = async (req, res) => {
  try {
    const { source, startDate, endDate } = req.query;

    const filter = { userId: req.user._id };

    if (source) filter.source = source;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const incomes = await Income.find(filter).sort({ date: -1 });

    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/income/:id
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/income/:id
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { amount, source, description, date } = req.body;

    income.amount = amount ?? income.amount;
    income.source = source ?? income.source;
    income.description = description ?? income.description;
    income.date = date ?? income.date;

    const updated = await income.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/income/:id
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await income.deleteOne();
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/income/summary
// Returns total income + breakdown by source for the current month
const getIncomeSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const summary = await Income.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalIncome = summary.reduce((acc, item) => acc + item.total, 0);

    res.json({ totalIncome, breakdown: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
};
