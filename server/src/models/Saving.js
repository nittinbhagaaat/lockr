const mongoose = require("mongoose");

const savingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    label: {
      type: String,
      trim: true,
      default: "General Savings",
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null, // null means it's general savings, not linked to a goal
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// After saving, auto-update the linked goal's savedAmount
savingSchema.post("save", async function () {
  if (this.goalId) {
    const Goal = require("./Goal");
    const totalSaved = await mongoose
      .model("Saving")
      .aggregate([
        { $match: { goalId: this.goalId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

    const total = totalSaved[0]?.total || 0;
    await Goal.findByIdAndUpdate(this.goalId, {
      savedAmount: total,
      status:
        total >= (await Goal.findById(this.goalId))?.targetAmount
          ? "completed"
          : "active",
    });
  }
});

module.exports = mongoose.model("Saving", savingSchema);
