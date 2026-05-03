const express = require("express");
const router = express.Router();
const {
  getSummary,
  getMonthlySummary,
  getTrend,
  getGoalsProgress,
  getRecentTransactions,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/summary", getSummary);
router.get("/monthly", getMonthlySummary);
router.get("/trend", getTrend);
router.get("/goals-progress", getGoalsProgress);
router.get("/recent", getRecentTransactions);

module.exports = router;
