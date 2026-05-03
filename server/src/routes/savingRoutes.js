const express = require("express");
const router = express.Router();
const {
  addSaving,
  getSavings,
  getSavingsTotal,
  getSavingById,
  updateSaving,
  deleteSaving,
} = require("../controllers/savingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getSavings).post(addSaving);
router.get("/total", getSavingsTotal); // must be before /:id
router.route("/:id").get(getSavingById).put(updateSaving).delete(deleteSaving);

module.exports = router;
