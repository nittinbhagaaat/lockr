const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalSavings,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getGoals).post(createGoal);
router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);
router.get("/:id/savings", getGoalSavings);

module.exports = router;
