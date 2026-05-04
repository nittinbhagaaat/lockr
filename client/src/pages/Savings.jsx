/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useMemo, useEffect } from "react";
import { savingAPI, goalAPI } from "../api/services";
import { useFetch } from "../hooks/useFetch";
import Modal from "../components/shared/Modal";
import Button from "../components/shared/Button";
import Spinner from "../components/shared/Spinner";
import {
  Plus,
  Pencil,
  Search,
  PiggyBank,
  Target,
  Unlock,
  Lock,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────
const EMPTY_FORM = { amount: "", label: "", goalId: "", date: "" };

// ── Responsive hook ───────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ── inputStyle — module level (avoids render component error) ─
const inputStyle = (hasError) => ({
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 14,
  borderRadius: 9,
  border: `1px solid ${hasError ? "#ef4444" : "var(--border)"}`,
  background: "var(--bg-input)",
  color: "var(--text-1)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

// ── PageHeader ────────────────────────────────────────
function PageHeader({ onAdd }) {
  return (
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
          Savings
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Lock money away — general or towards a goal
        </p>
      </div>
      <Button
        onClick={onAdd}
        style={{ paddingInline: 16, background: "#8b5cf6", color: "#fff" }}
      >
        <Plus size={15} strokeWidth={2.5} /> Lock Money
      </Button>
    </div>
  );
}

// ── SummaryBar ────────────────────────────────────────
function SummaryBar({ data, width }) {
  const total = data.reduce((s, e) => s + e.amount, 0);
  const goalLinked = data
    .filter((e) => !!e.goalId)
    .reduce((s, e) => s + e.amount, 0);
  const general = total - goalLinked;

  const thisMonth = useMemo(() => {
    const now = new Date();
    return data
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [data]);

  const cards = [
    {
      label: "Total Locked",
      value: `₹${total.toLocaleString("en-IN")}`,
      color: "#8b5cf6",
    },
    {
      label: "Goal-linked",
      value: `₹${goalLinked.toLocaleString("en-IN")}`,
      color: "#6366f1",
    },
    {
      label: "General Savings",
      value: `₹${general.toLocaleString("en-IN")}`,
      color: "#14b8a6",
    },
    {
      label: "Saved This Month",
      value: `₹${thisMonth.toLocaleString("en-IN")}`,
      color: "var(--accent)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: width < 640 ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 20,
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
            {c.label}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: c.color,
              letterSpacing: "-0.3px",
            }}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Filters ───────────────────────────────────────────
function Filters({
  search,
  setSearch,
  filter,
  setFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  width,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
        alignItems: "center",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}>
        <Search
          size={13}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
            pointerEvents: "none",
          }}
        />
        <input
          placeholder="Search label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 30,
            paddingRight: 12,
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-input)",
            color: "var(--text-1)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#8b5cf6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
          }}
        />
      </div>

      {/* Type filter */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          height: 36,
          padding: "0 12px",
          fontSize: 13,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg-input)",
          color: "var(--text-1)",
          outline: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#8b5cf6";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
        }}
      >
        <option value="">All savings</option>
        <option value="general">General only</option>
        <option value="goal">Goal-linked only</option>
      </select>

      {/* Date range — hidden on mobile */}
      {width >= 640 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={13} color="var(--text-3)" style={{ flexShrink: 0 }} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              height: 36,
              padding: "0 10px",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-input)",
              color: "var(--text-1)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#8b5cf6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
            }}
          />
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              height: 36,
              padding: "0 10px",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-input)",
              color: "var(--text-1)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#8b5cf6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
            }}
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              style={{
                height: 36,
                padding: "0 10px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-3)",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── SavingsTable ──────────────────────────────────────
function SavingsTable({ data, goals, onEdit, onDelete, deleting, width }) {
  const goalMap = useMemo(() => {
    const m = {};
    (goals || []).forEach((g) => {
      m[g._id] = g;
    });
    return m;
  }, [goals]);

  if (!data.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "56px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "var(--text-3)",
        }}
      >
        <PiggyBank size={32} strokeWidth={1.2} />
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)" }}>
          No savings yet
        </p>
        <p style={{ fontSize: 12 }}>Lock your first amount to start saving</p>
      </div>
    );
  }

  // ── Mobile card list ──
  if (width < 768) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {data.map((sav, i) => {
          const goal = sav.goalId ? goalMap[sav.goalId] : null;
          return (
            <div
              key={sav._id}
              style={{
                padding: "14px 16px",
                borderBottom:
                  i < data.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: goal
                        ? "rgba(99,102,241,0.1)"
                        : "rgba(139,92,246,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {goal ? (
                      <Target size={12} color="#6366f1" />
                    ) : (
                      <Lock size={12} color="#8b5cf6" />
                    )}
                  </div>
                  {goal ? (
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: "#6366f1",
                        background: "rgba(99,102,241,0.1)",
                        padding: "2px 8px",
                        borderRadius: 99,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 120,
                      }}
                    >
                      🎯 {goal.name}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-3)",
                        background: "var(--bg-input)",
                        padding: "2px 8px",
                        borderRadius: 99,
                        whiteSpace: "nowrap",
                      }}
                    >
                      General
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-3)",
                      flexShrink: 0,
                    }}
                  >
                    {new Date(sav.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--text-1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sav.label || "Untitled saving"}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "#8b5cf6" }}
                >
                  ₹{sav.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => onEdit(sav)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(sav._id)}
                  disabled={deleting === sav._id}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: deleting === sav._id ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting === sav._id ? (
                    <Spinner size={12} />
                  ) : (
                    <Unlock size={12} />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div
          style={{
            padding: "11px 16px",
            background: "var(--bg-input)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)" }}
          >
            {data.length} {data.length === 1 ? "entry" : "entries"}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#8b5cf6" }}>
            ₹{data.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    );
  }

  // ── Desktop table ──
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Head */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px 140px 110px 80px",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-input)",
        }}
      >
        {["Label", "Linked Goal", "Date", "Amount", ""].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {data.map((sav) => {
        const goal = sav.goalId ? goalMap[sav.goalId] : null;
        return (
          <div
            key={sav._id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 140px 110px 80px",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-input)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  flexShrink: 0,
                  background: goal
                    ? "rgba(99,102,241,0.1)"
                    : "rgba(139,92,246,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {goal ? (
                  <Target size={13} color="#6366f1" />
                ) : (
                  <Lock size={13} color="#8b5cf6" />
                )}
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--text-1)",
                }}
              >
                {sav.label || "Untitled saving"}
              </span>
            </div>

            {/* Linked goal */}
            <div>
              {goal ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#6366f1",
                    background: "rgba(99,102,241,0.1)",
                    padding: "3px 9px",
                    borderRadius: 99,
                    display: "inline-block",
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  🎯 {goal.name}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-3)",
                    background: "var(--bg-input)",
                    padding: "3px 9px",
                    borderRadius: 99,
                    display: "inline-block",
                  }}
                >
                  General
                </span>
              )}
            </div>

            <span style={{ fontSize: 13, color: "var(--text-2)" }}>
              {new Date(sav.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span style={{ fontSize: 14, fontWeight: 600, color: "#8b5cf6" }}>
              ₹{sav.amount.toLocaleString("en-IN")}
            </span>

            <div
              style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => onEdit(sav)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: "none",
                  background: "transparent",
                  color: "var(--text-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(sav._id)}
                disabled={deleting === sav._id}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: "none",
                  background: "transparent",
                  color: "var(--text-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: deleting === sav._id ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                {deleting === sav._id ? (
                  <Spinner size={13} />
                ) : (
                  <Unlock size={13} />
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px 140px 110px 80px",
          padding: "11px 16px",
          background: "var(--bg-input)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-2)" }}
        >
          {data.length} {data.length === 1 ? "entry" : "entries"}
        </span>
        <span />
        <span />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#8b5cf6" }}>
          ₹{data.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
        </span>
        <span />
      </div>
    </div>
  );
}

// ── SavingForm ────────────────────────────────────────
function SavingForm({
  form,
  setForm,
  errors,
  loading,
  onSubmit,
  onClose,
  isEdit,
  goals,
}) {
  const today = new Date().toISOString().split("T")[0];
  const activeGoals = (goals || []).filter((g) => g.status !== "abandoned");

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Amount */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            marginBottom: 6,
          }}
        >
          Amount (₹) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: "var(--text-2)",
              pointerEvents: "none",
            }}
          >
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0.00"
            style={{ ...inputStyle(errors.amount), paddingLeft: 28 }}
            onFocus={(e) => {
              e.target.style.borderColor = "#8b5cf6";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.amount
                ? "#ef4444"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        {errors.amount && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
            {errors.amount}
          </p>
        )}
      </div>

      {/* Label */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            marginBottom: 6,
          }}
        >
          Label
        </label>
        <input
          type="text"
          value={form.label}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
          placeholder="e.g. Monthly savings, Emergency fund..."
          style={inputStyle(false)}
          onFocus={(e) => {
            e.target.style.borderColor = "#8b5cf6";
            e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Link to goal */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            marginBottom: 6,
          }}
        >
          Link to Goal{" "}
          <span
            style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 400 }}
          >
            (optional)
          </span>
        </label>
        <select
          value={form.goalId}
          onChange={(e) => setForm((p) => ({ ...p, goalId: e.target.value }))}
          style={{ ...inputStyle(false), cursor: "pointer" }}
          onFocus={(e) => {
            e.target.style.borderColor = "#8b5cf6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
          }}
        >
          <option value="">— General savings (no goal) —</option>
          {activeGoals.map((g) => (
            <option key={g._id} value={g._id}>
              🎯 {g.name} (₹
              {(g.targetAmount - g.savedAmount).toLocaleString("en-IN")}{" "}
              remaining)
            </option>
          ))}
        </select>
        {form.goalId && (
          <p style={{ fontSize: 12, color: "#6366f1", marginTop: 5 }}>
            This amount will be added to the selected goal's progress
          </p>
        )}
      </div>

      {/* Date */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            marginBottom: 6,
          }}
        >
          Date <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="date"
          value={form.date}
          max={today}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          style={inputStyle(errors.date)}
          onFocus={(e) => {
            e.target.style.borderColor = "#8b5cf6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.date
              ? "#ef4444"
              : "var(--border)";
          }}
        />
        {errors.date && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
            {errors.date}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          style={{ background: "#8b5cf6", color: "#fff" }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#7c3aed";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#8b5cf6";
          }}
        >
          <Lock size={13} />
          {isEdit ? "Save Changes" : "Lock Money"}
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function Savings() {
  const {
    data: raw = [],
    loading: l1,
    refetch,
  } = useFetch(() => savingAPI.getAll());
  const { data: goals = [], loading: l2 } = useFetch(() => goalAPI.getAll());
  const width = useWindowWidth();

  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const data = useMemo(() => {
    return (raw || []).filter((e) => {
      const matchSearch =
        !search || e.label?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        !filter ||
        (filter === "goal" && !!e.goalId) ||
        (filter === "general" && !e.goalId);
      const matchDateFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(e.date) <= new Date(dateTo);
      return matchSearch && matchFilter && matchDateFrom && matchDateTo;
    });
  }, [raw, search, filter, dateFrom, dateTo]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
      e.amount = "Enter a valid amount greater than 0";
    if (!form.date) e.date = "Select a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
    setErrors({});
    setModal("add");
  };

  const openEdit = (sav) => {
    setEditing(sav);
    setForm({
      amount: sav.amount,
      label: sav.label || "",
      goalId: sav.goalId || "",
      date: sav.date?.split("T")[0] || "",
    });
    setErrors({});
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        label: form.label.trim(),
        goalId: form.goalId || null,
        date: form.date,
      };
      if (modal === "edit") {
        await savingAPI.update(editing._id, payload);
        toast.success("Saving updated");
      } else {
        await savingAPI.create(payload);
        toast.success("Money locked 🔒");
      }
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Unlock and remove this saving?")) return;
    setDeleting(id);
    try {
      await savingAPI.delete(id);
      toast.success("Saving removed");
      refetch();
    } catch {
      toast.error("Failed to remove");
    } finally {
      setDeleting(null);
    }
  };

  const loading = l1 || l2;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader onAdd={openAdd} />

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <Spinner size={28} />
        </div>
      ) : (
        <>
          <SummaryBar data={raw || []} width={width} />
          <Filters
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            width={width}
          />
          <SavingsTable
            data={data}
            goals={goals}
            onEdit={openEdit}
            onDelete={onDelete}
            deleting={deleting}
            width={width}
          />
        </>
      )}

      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal === "edit" ? "Edit Saving" : "Lock Money"}
        width={440}
      >
        <SavingForm
          form={form}
          setForm={setForm}
          errors={errors}
          loading={saving}
          onSubmit={onSubmit}
          onClose={closeModal}
          isEdit={modal === "edit"}
          goals={goals}
        />
      </Modal>
    </div>
  );
}
