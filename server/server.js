const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/expenses", require("./src/routes/expenseRoutes"));
app.use("/api/income", require("./src/routes/incomeRoutes"));
app.use("/api/savings", require("./src/routes/savingRoutes"));
app.use("/api/goals", require("./src/routes/goalRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Lockr API is running 🔐" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
