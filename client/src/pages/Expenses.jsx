import { useState, useMemo } from "react";
import { expenseAPI } from "../api/services";
import { useFetch } from "../hooks/useFetch";
import Modal from "../components/shared/Modal";
import Button from "../components/shared/Button";
import Spinner from "../components/shared/Spinner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  TrendingDown,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────
const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills & Utilities",
  "Rent",
  "Travel",
  "Subscriptions",
  "Other",
];

const CAT_COLORS = {
  Food: "#f97316",
  Transport: "#06b6d4",
  Shopping: "#ec4899",
  Entertainment: "#8b5cf6",
  Health: "#22c55e",
  Education: "#3b82f6",
  "Bills & Utilities": "#ef4444",
  Rent: "#f59e0b",
  Travel: "#14b8a6",
  Subscriptions: "#6366f1",
  Other: "#9ca3af",
};

const EMPTY_FORM = { amount: "", category: "Food", description: "", date: "" };

// ── Sub-components ────────────────────────────────────

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
          Expenses
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Track and manage your spending
        </p>
      </div>
      <Button onClick={onAdd} style={{ paddingInline: 16 }}>
        <Plus size={15} strokeWidth={2.5} /> Add Expense
      </Button>
    </div>
  );
}

function SummaryBar({ data }) {
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

  const total = data.reduce((s, e) => s + e.amount, 0);

  const topCat = useMemo(() => {
    const map = {};
    data.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, [data]);

  const cards = [
    {
      label: "Total Spent",
      value: `₹${total.toLocaleString("en-IN")}`,
      color: "#ef4444",
    },
    {
      label: "This Month",
      value: `₹${thisMonth.toLocaleString("en-IN")}`,
      color: "#f97316",
    },
    {
      label: "Top Category",
      value: topCat ? topCat[0] : "—",
      color: CAT_COLORS[topCat?.[0]] || "var(--accent)",
    },
    { label: "Total Entries", value: data.length, color: "#8b5cf6" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
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

function Filters({
  search,
  setSearch,
  category,
  setCategory,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
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
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
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
          placeholder="Search description..."
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
            e.target.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
          }}
        />
      </div>

      {/* Category filter */}
      <div style={{ position: "relative" }}>
        <Filter
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            height: 36,
            paddingLeft: 28,
            paddingRight: 28,
            fontSize: 13,
            borderRadius: 8,
            appearance: "none",
            border: "1px solid var(--border)",
            background: "var(--bg-input)",
            color: category ? "var(--text-1)" : "var(--text-3)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
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
            e.target.style.borderColor = "var(--accent)";
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
            e.target.style.borderColor = "var(--accent)";
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
    </div>
  );
}

function ExpenseTable({ data, onEdit, onDelete, deleting }) {
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
        <TrendingDown size={32} strokeWidth={1.2} />
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)" }}>
          No expenses found
        </p>
        <p style={{ fontSize: 12 }}>Add your first expense or adjust filters</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Table head */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 130px 120px 100px 80px",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-input)",
        }}
      >
        {["Description", "Category", "Date", "Amount", ""].map((h) => (
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
      {data.map((exp) => {
        const catColor = CAT_COLORS[exp.category] || "var(--text-3)";
        return (
          <div
            key={exp._id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 120px 100px 80px",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-input)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {/* Description */}
            <div>
              <p
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--text-1)",
                  marginBottom: 2,
                }}
              >
                {exp.description || "—"}
              </p>
            </div>

            {/* Category badge */}
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: catColor,
                  background: `${catColor}15`,
                  padding: "3px 9px",
                  borderRadius: 99,
                  display: "inline-block",
                }}
              >
                {exp.category}
              </span>
            </div>

            {/* Date */}
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>
              {new Date(exp.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            {/* Amount */}
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>
              −₹{exp.amount.toLocaleString("en-IN")}
            </span>

            {/* Actions */}
            <div
              style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => onEdit(exp)}
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
                onClick={() => onDelete(exp._id)}
                disabled={deleting === exp._id}
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
                  cursor: deleting === exp._id ? "not-allowed" : "pointer",
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
                {deleting === exp._id ? (
                  <Spinner size={13} />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Footer total */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 130px 120px 100px 80px",
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
        <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>
          −₹{data.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
        </span>
        <span />
      </div>
    </div>
  );
}

function ExpenseForm({
  form,
  setForm,
  errors,
  loading,
  onSubmit,
  onClose,
  isEdit,
}) {
  const today = new Date().toISOString().split("T")[0];

  const field = (label, key, type = "text", extra = {}) => (
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
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        max={type === "date" ? today : undefined}
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px",
          fontSize: 14,
          borderRadius: 9,
          border: `1px solid ${errors[key] ? "#ef4444" : "var(--border)"}`,
          background: "var(--bg-input)",
          color: "var(--text-1)",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...extra,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = errors[key]
            ? "#ef4444"
            : "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
      {errors[key] && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

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
            style={{
              width: "100%",
              height: 40,
              paddingLeft: 28,
              paddingRight: 12,
              fontSize: 14,
              borderRadius: 9,
              border: `1px solid ${errors.amount ? "#ef4444" : "var(--border)"}`,
              background: "var(--bg-input)",
              color: "var(--text-1)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
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

      {/* Category */}
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
          Category <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          style={{
            width: "100%",
            height: 40,
            padding: "0 12px",
            fontSize: 14,
            borderRadius: 9,
            border: "1px solid var(--border)",
            background: "var(--bg-input)",
            color: "var(--text-1)",
            outline: "none",
            cursor: "pointer",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      {field("Description", "description", "text")}

      {/* Date */}
      {field("Date", "date", "date")}

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
        <Button type="submit" loading={loading}>
          {isEdit ? "Save Changes" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function Expenses() {
  const {
    data: raw = [],
    loading,
    refetch,
  } = useFetch(() => expenseAPI.getAll());

  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Filtered data ──
  const data = useMemo(() => {
    return (raw || []).filter((e) => {
      const matchSearch =
        !search || e.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || e.category === category;
      const matchDateFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(e.date) <= new Date(dateTo);
      return matchSearch && matchCat && matchDateFrom && matchDateTo;
    });
  }, [raw, search, category, dateFrom, dateTo]);

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
      e.amount = "Enter a valid amount greater than 0";
    if (!form.category) e.category = "Select a category";
    if (!form.date) e.date = "Select a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Open add modal ──
  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
    setErrors({});
    setModal("add");
  };

  // ── Open edit modal ──
  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      amount: exp.amount,
      category: exp.category,
      description: exp.description || "",
      date: exp.date?.split("T")[0] || "",
    });
    setErrors({});
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  // ── Submit (add or edit) ──
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      };
      if (modal === "edit") {
        await expenseAPI.update(editing._id, payload);
        toast.success("Expense updated");
      } else {
        await expenseAPI.create(payload);
        toast.success("Expense added");
      }
      refetch();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const onDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      await expenseAPI.delete(id);
      toast.success("Expense deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

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
          <SummaryBar data={raw || []} />

          <Filters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
          />

          <ExpenseTable
            data={data}
            onEdit={openEdit}
            onDelete={onDelete}
            deleting={deleting}
          />
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal === "edit" ? "Edit Expense" : "Add Expense"}
        width={440}
      >
        <ExpenseForm
          form={form}
          setForm={setForm}
          errors={errors}
          loading={saving}
          onSubmit={onSubmit}
          onClose={closeModal}
          isEdit={modal === "edit"}
        />
      </Modal>
    </div>
  );
}
