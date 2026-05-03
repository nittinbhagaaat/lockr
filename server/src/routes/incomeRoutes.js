const express = require("express");
const router = express.Router();
const {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getIncomes).post(addIncome);
router.get("/summary", getIncomeSummary); // must be before /:id
router.route("/:id").get(getIncomeById).put(updateIncome).delete(deleteIncome);

module.exports = router;
