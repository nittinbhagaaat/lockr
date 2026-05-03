import React, { useState } from "react";
import { analyticsAPI } from "../api/services";
import { useFetch } from "../hooks/useFetch";
import Spinner from "../components/shared/Spinner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  BarChart2,
  Calendar,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PALETTE = [
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#3b82f6",
];

// ── Helpers ───────────────────────────────────────────
const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

// ── Custom Tooltip ─────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 9,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        fontSize: 12,
      }}
    >
      {label && (
        <p style={{ color: "var(--text-2)", marginBottom: 6, fontWeight: 600 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-2)" }}>{p.name}:</span>
          <span style={{ color: "var(--text-1)", fontWeight: 600 }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 9,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        fontSize: 12,
      }}
    >
      <p style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 3 }}>
        {p.name}
      </p>
      <p style={{ color: p.payload.fill }}>{fmt(p.value)}</p>
      <p style={{ color: "var(--text-3)" }}>{p.payload.pct}%</p>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────
function ChartCard({ title, subtitle, children, height = 280 }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-1)",
            marginBottom: 2,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>{subtitle}</p>
        )}
      </div>
      <div style={{ padding: "16px 12px 12px", height }}>{children}</div>
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────
function StatPill({ label, value, icon: Icon, color }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          flexShrink: 0,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 3 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color,
            letterSpacing: "-0.3px",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Year picker ────────────────────────────────────────
function YearPicker({ year, setYear }) {
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Calendar size={13} color="var(--text-3)" />
      <select
        value={year}
        onChange={(e) => setYear(+e.target.value)}
        style={{
          height: 32,
          padding: "0 10px",
          fontSize: 13,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-input)",
          color: "var(--text-1)",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── No data placeholder ────────────────────────────────
function NoData({ text = "No data yet" }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "var(--text-3)",
      }}
    >
      <BarChart2 size={28} strokeWidth={1.2} />
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}

function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ── Main page ──────────────────────────────────────────
export default function Analytics() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: summary, loading: l1 } = useFetch(() => analyticsAPI.summary());
  const { data: trend, loading: l2 } = useFetch(
    () => analyticsAPI.trend({ year }),
    [year],
  );
  const { data: goals, loading: l3 } = useFetch(() =>
    analyticsAPI.goalsProgress(),
  );
  const { data: monthly, loading: l4 } = useFetch(() => {
    const now = new Date();
    return analyticsAPI.monthly({
      year: now.getFullYear(),
      month: now.getMonth(),
    });
  });

  // ── Trend chart data ──
  // Expected from backend: array of 12 { month, income, expenses, savings }
  const trendData = (trend || []).map((d) => ({
    month: MONTHS[d.month - 1] || d.month,
    Income: d.income || 0,
    Expenses: d.expenses || 0,
    Savings: d.savings || 0,
  }));

  // ── Expense pie data from monthly breakdown ──
  const pieData = (monthly?.expenseBreakdown || []).map((c, i) => {
    const total = monthly?.totalExpenses || 1;
    return {
      name: c._id,
      value: c.total,
      pct: Math.round((c.total / total) * 100),
      fill: PALETTE[i % PALETTE.length],
    };
  });

  // ── Goals chart data ──
  const goalsData = (goals || [])
    .filter((g) => g.status !== "abandoned")
    .map((g) => ({
      name: g.name.length > 14 ? g.name.slice(0, 14) + "…" : g.name,
      Saved: g.savedAmount || 0,
      Target: g.targetAmount || 0,
    }));

  // ── Net balance from summary ──
  const net = summary?.netBalance || 0;
  const netColor = net >= 0 ? "#22c55e" : "#ef4444";

  const loading = l1 || l2 || l3 || l4;
  const width = useWindowWidth();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: 3,
            }}
          >
            Analytics
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            Visual overview of your financial activity
          </p>
        </div>
        <YearPicker year={year} setYear={setYear} />
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Spinner size={28} />
        </div>
      ) : (
        <>
          {/* ── Summary pills ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                width < 640
                  ? "repeat(2, 1fr)"
                  : width < 1024
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <StatPill
              label="Total Income"
              value={fmt(summary?.totalIncome)}
              icon={TrendingUp}
              color="#22c55e"
            />
            <StatPill
              label="Total Expenses"
              value={fmt(summary?.totalExpenses)}
              icon={TrendingDown}
              color="#ef4444"
            />
            <StatPill
              label="Total Savings"
              value={fmt(summary?.totalSavings)}
              icon={PiggyBank}
              color="#8b5cf6"
            />
            <StatPill
              label="Net Balance"
              value={fmt(net)}
              icon={Wallet}
              color={netColor}
            />
          </div>

          {/* ── Row 1: Trend (full width) ── */}
          <div style={{ marginBottom: 14 }}>
            <ChartCard
              title={`Monthly Overview — ${year}`}
              subtitle="Income, expenses and savings across all months"
              height={300}
            >
              {!trendData.length ? (
                <NoData text="No data for this year" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barCategoryGap="30%" barGap={4}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--bg-input)" }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        paddingTop: 8,
                        color: "var(--text-2)",
                      }}
                    />
                    <Bar
                      dataKey="Income"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Expenses"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Savings"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ── Row 2: Savings trend line + Expense pie ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: width < 768 ? "1fr" : "1.4fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* Savings trend */}
            <ChartCard
              title="Savings Trend"
              subtitle="How your locked savings grew month by month"
              height={260}
            >
              {!trendData.length ? (
                <NoData />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Savings"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Expense pie */}
            <ChartCard
              title="Spending by Category"
              subtitle={`This month — ${new Date().toLocaleString("default", { month: "long" })}`}
              height={260}
            >
              {!pieData.length ? (
                <NoData text="No expenses this month" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="45%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span style={{ fontSize: 11, color: "var(--text-2)" }}>
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ── Row 3: Goals progress bar chart ── */}
          <div style={{ marginBottom: 14 }}>
            <ChartCard
              title="Goals Progress"
              subtitle="Saved vs target amount per goal"
              height={280}
            >
              {!goalsData.length ? (
                <NoData text="No active goals" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={goalsData}
                    layout="vertical"
                    barCategoryGap="30%"
                    barGap={3}
                    margin={{ left: 8, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--text-2)" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--bg-input)" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "var(--text-2)" }}
                    />
                    <Bar
                      dataKey="Target"
                      fill="var(--border)"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="Saved"
                      fill="var(--accent)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ── Row 4: Income vs Expense line trend ── */}
          <div>
            <ChartCard
              title="Income vs Expenses — Line View"
              subtitle={`Full year comparison for ${year}`}
              height={260}
            >
              {!trendData.length ? (
                <NoData text="No data for this year" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtShort}
                      tick={{ fontSize: 11, fill: "var(--text-3)" }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "var(--text-2)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Income"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Expenses"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
