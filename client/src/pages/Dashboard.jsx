import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI } from "../api/services";
import { useFetch } from "../hooks/useFetch";
import Spinner from "../components/shared/Spinner";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";

// ─────────────────────────────────────────────
// Stat Card — compact, no wasted space
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 500 }}
        >
          {label}
        </span>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={color} strokeWidth={2} />
        </div>
      </div>
      <div>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            marginBottom: 5,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Transaction row
// ─────────────────────────────────────────────
function TxRow({ item }) {
  const isExpense = item.type === "expense";
  const isSaving = item.type === "saving";
  const color = isExpense ? "#ef4444" : isSaving ? "#8b5cf6" : "#22c55e";
  const bgColor = isExpense
    ? "rgba(239,68,68,0.08)"
    : isSaving
      ? "rgba(139,92,246,0.08)"
      : "rgba(34,197,94,0.08)";
  const label = item.category || item.source || item.label || "—";
  const prefix = isExpense ? "−" : "+";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: bgColor,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isExpense ? (
            <ArrowDownRight size={15} color="#ef4444" />
          ) : isSaving ? (
            <PiggyBank size={15} color="#8b5cf6" />
          ) : (
            <ArrowUpRight size={15} color="#22c55e" />
          )}
        </div>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-1)",
              marginBottom: 2,
            }}
          >
            {label}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>
            {new Date(item.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 600, color, flexShrink: 0 }}>
        {prefix}₹{item.amount.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Goal progress row
// ─────────────────────────────────────────────
function GoalRow({ goal }) {
  const pct = Math.min(goal.progressPercent || 0, 100);
  const barColor =
    pct >= 100 ? "#22c55e" : pct >= 60 ? "var(--accent)" : "#8b5cf6";

  return (
    <div
      style={{
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
          {goal.name}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: barColor }}>
          {pct}%
        </span>
      </div>
      {/* Bar */}
      <div
        style={{
          height: 5,
          borderRadius: 99,
          background: "var(--bg-input)",
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: 99,
            transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          ₹{(goal.savedAmount || 0).toLocaleString("en-IN")} saved
        </span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          Goal: ₹{(goal.targetAmount || 0).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────
function Section({ title, linkLabel, onLink, children, minHeight = 0 }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>
          {title}
        </h3>
        {linkLabel && (
          <button
            onClick={onLink}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {linkLabel} →
          </button>
        )}
      </div>
      <div style={{ padding: "4px 18px 6px", flex: 1, minHeight }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state — inline, compact
// ─────────────────────────────────────────────
function Blank({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        gap: 8,
        color: "var(--text-3)",
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 12.5, textAlign: "center" }}>{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Quick action button
// ─────────────────────────────────────────────
function QuickBtn({ label, color, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        background: bgColor,
        color,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <Plus size={13} strokeWidth={2.5} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: summary, loading: l1 } = useFetch(() => analyticsAPI.summary());
  const { data: recent, loading: l2 } = useFetch(() =>
    analyticsAPI.recent({ limit: 6 }),
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

  const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Net balance color
  const net = summary?.netBalance || 0;
  const netColor = net >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
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
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <QuickBtn
            label="Expense"
            color="#ef4444"
            bgColor="rgba(239,68,68,0.1)"
            onClick={() => navigate("/expenses")}
          />
          <QuickBtn
            label="Income"
            color="#22c55e"
            bgColor="rgba(34,197,94,0.1)"
            onClick={() => navigate("/income")}
          />
          <QuickBtn
            label="Savings"
            color="#8b5cf6"
            bgColor="rgba(139,92,246,0.1)"
            onClick={() => navigate("/savings")}
          />
        </div>
      </div>

      {/* ── Stat cards — 2 rows of 3 ── */}
      {l1 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "36px 0",
          }}
        >
          <Spinner size={26} />
        </div>
      ) : (
        <>
          {/* Row 1 — money totals */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <StatCard
              label="Total Income"
              value={fmt(summary?.totalIncome)}
              icon={TrendingUp}
              color="#22c55e"
              sub="All time"
            />
            <StatCard
              label="Total Expenses"
              value={fmt(summary?.totalExpenses)}
              icon={TrendingDown}
              color="#ef4444"
              sub="All time"
            />
            <StatCard
              label="Net Balance"
              value={<span style={{ color: netColor }}>{fmt(net)}</span>}
              icon={Wallet}
              color="var(--accent)"
              sub="Income − Expenses − Savings"
            />
          </div>

          {/* Row 2 — savings + goals + this month */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <StatCard
              label="Total Savings"
              value={fmt(summary?.totalSavings)}
              icon={PiggyBank}
              color="#8b5cf6"
              sub="Locked away"
            />
            <StatCard
              label="Active Goals"
              value={summary?.goals?.active ?? "0"}
              icon={Target}
              color="var(--accent)"
              sub={`${summary?.goals?.completed ?? 0} completed · ${summary?.goals?.abandoned ?? 0} abandoned`}
            />
            <StatCard
              label="Spent This Month"
              value={l4 ? "..." : fmt(monthly?.totalExpenses)}
              icon={TrendingDown}
              color="#f97316"
              sub={new Date().toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </>
      )}

      {/* ── Bottom sections — 3 columns ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        {/* Recent Transactions */}
        <Section
          title="Recent Transactions"
          linkLabel="View all"
          onLink={() => navigate("/expenses")}
          minHeight={200}
        >
          {l2 ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 28 }}
            >
              <Spinner />
            </div>
          ) : !recent?.length ? (
            <Blank icon="💸" text="No transactions yet" />
          ) : (
            recent.map((item) => <TxRow key={item._id} item={item} />)
          )}
        </Section>

        {/* Goals Progress */}
        <Section
          title="Goals Progress"
          linkLabel="Manage"
          onLink={() => navigate("/goals")}
          minHeight={200}
        >
          {l3 ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 28 }}
            >
              <Spinner />
            </div>
          ) : !goals?.length ? (
            <Blank icon="🎯" text="No goals created yet" />
          ) : (
            <div style={{ paddingTop: 10 }}>
              {goals.map((g) => (
                <GoalRow key={g._id} goal={g} />
              ))}
            </div>
          )}
        </Section>

        {/* Monthly Spending */}
        <Section
          title={`${new Date().toLocaleString("default", { month: "long" })} Breakdown`}
          linkLabel="Analytics"
          onLink={() => navigate("/analytics")}
          minHeight={200}
        >
          {l4 ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 28 }}
            >
              <Spinner />
            </div>
          ) : !monthly?.expenseBreakdown?.length ? (
            <Blank icon="📊" text="No expenses this month" />
          ) : (
            <div style={{ paddingTop: 10 }}>
              {monthly.expenseBreakdown.map((cat, i) => {
                const pct =
                  monthly.totalExpenses > 0
                    ? Math.round((cat.total / monthly.totalExpenses) * 100)
                    : 0;
                const colors = [
                  "var(--accent)",
                  "#8b5cf6",
                  "#22c55e",
                  "#ef4444",
                  "#f97316",
                  "#06b6d4",
                ];
                const c = colors[i % colors.length];
                return (
                  <div key={cat._id} style={{ marginBottom: 13 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "var(--text-1)",
                          fontWeight: 500,
                        }}
                      >
                        {cat._id}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                        ₹{cat.total.toLocaleString("en-IN")} · {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 99,
                        background: "var(--bg-input)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: c,
                          borderRadius: 99,
                          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Responsive: stack to 1 col on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .dash-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-stats-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
