import { useState } from "react";
import { authAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";
import Button from "../components/shared/Button";
import {
  User,
  Palette,
  Lock,
  CheckCircle2,
  IndianRupee,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────
const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen (¥)" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar (A$)" },
];

const THEMES = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

// ── Shared helpers ────────────────────────────────────
function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-input)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(245,158,11,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} color="var(--accent)" />
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
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
        {hint && (
          <span
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              fontWeight: 400,
              marginLeft: 6,
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

function Input({ error, focusColor = "var(--accent)", ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 40,
        padding: "0 12px",
        fontSize: 14,
        borderRadius: 9,
        border: `1px solid ${error ? "#ef4444" : "var(--border)"}`,
        background: "var(--bg-input)",
        color: "var(--text-1)",
        outline: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = focusColor;
        e.target.style.boxShadow = `0 0 0 3px ${focusColor}22`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? "#ef4444" : "var(--border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), #f97316)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ── PasswordField — TOP LEVEL (outside SecuritySection) ──────────────
function PasswordField({
  fieldKey,
  label,
  placeholder,
  form,
  setForm,
  errors,
  show,
  setShow,
}) {
  return (
    <Field label={label} error={errors[fieldKey]}>
      <div style={{ position: "relative" }}>
        <Input
          type={show[fieldKey] ? "text" : "password"}
          value={form[fieldKey]}
          onChange={(e) =>
            setForm((p) => ({ ...p, [fieldKey]: e.target.value }))
          }
          placeholder={placeholder}
          error={errors[fieldKey]}
          focusColor="#8b5cf6"
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [fieldKey]: !p[fieldKey] }))}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--text-3)",
            cursor: "pointer",
            fontSize: 11,
            padding: 2,
          }}
        >
          {show[fieldKey] ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}

// ── ProfileSection ────────────────────────────────────
function ProfileSection({ user, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const { data } = await authAPI.updateMe({
        name: name.trim(),
        email: email.trim(),
      });
      toast.success("Profile updated ✓"); // ← move toast BEFORE onUpdate
      try {
        onUpdate({ ...data, token: user?.token ?? "" });
      } catch (e) {
        // context update failed silently — DB already saved, toast already shown
        console.log(e);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Profile"
      subtitle="Your name and email address"
      icon={User}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          padding: "12px 16px",
          background: "var(--bg-input)",
          borderRadius: 10,
          border: "1px solid var(--border)",
        }}
      >
        <Avatar name={name} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
            {name || "Your Name"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            {email || "email@example.com"}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>
            Member since{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Field label="Full Name" error={errors.name}>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              error={errors.name}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
            />
          </Field>
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}
        >
          <Button type="submit" loading={saving} style={{ paddingInline: 20 }}>
            <CheckCircle2 size={13} /> Save Profile
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── PreferencesSection ────────────────────────────────
function PreferencesSection({ user, onUpdate }) {
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("lockr-theme") || "system",
  );
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateMe({ currency });

      // Apply theme BEFORE onUpdate so it never gets blocked
      const root = document.documentElement;
      if (theme === "system") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.setAttribute("data-theme", isDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", theme);
      }
      localStorage.setItem("lockr-theme", theme);

      toast.success("Preferences saved ✓"); // ← before onUpdate

      try {
        onUpdate({ ...data, token: user?.token ?? "" });
      } catch (e) {
        // DB saved, theme applied, toast shown — silent fail on context
        console.log(e);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Preferences"
      subtitle="Currency display and app appearance"
      icon={Palette}
    >
      <form onSubmit={onSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <Field label="Currency" hint="(affects display only — no real money)">
            <div style={{ position: "relative" }}>
              <IndianRupee
                size={13}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-3)",
                  pointerEvents: "none",
                }}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  paddingLeft: 30,
                  paddingRight: 12,
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
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Theme">
            <div style={{ display: "flex", gap: 6 }}>
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTheme(t.key)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 9,
                    border: `1.5px solid ${theme === t.key ? "var(--accent)" : "var(--border)"}`,
                    background:
                      theme === t.key
                        ? "rgba(245,158,11,0.08)"
                        : "var(--bg-input)",
                    color: theme === t.key ? "var(--accent)" : "var(--text-2)",
                    fontSize: 13,
                    fontWeight: theme === t.key ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" loading={saving} style={{ paddingInline: 20 }}>
            <CheckCircle2 size={13} /> Save Preferences
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── SecuritySection ───────────────────────────────────
function SecuritySection() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "Current password is required";
    if (!form.newPass) e.newPass = "New password is required";
    if (form.newPass && form.newPass.length < 6)
      e.newPass = "Password must be at least 6 characters";
    if (form.newPass !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      toast.success("Password changed successfully");
      setForm({ current: "", newPass: "", confirm: "" });
      setShow({ current: false, newPass: false, confirm: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const strength = !form.newPass
    ? 0
    : form.newPass.length >= 12 &&
        /[A-Z]/.test(form.newPass) &&
        /[0-9]/.test(form.newPass) &&
        /[^a-zA-Z0-9]/.test(form.newPass)
      ? 4
      : form.newPass.length >= 8 &&
          /[A-Z]/.test(form.newPass) &&
          /[0-9]/.test(form.newPass)
        ? 3
        : form.newPass.length >= 6 && /[0-9]/.test(form.newPass)
          ? 2
          : 1;

  const strengthColor =
    strength >= 4
      ? "#22c55e"
      : strength >= 3
        ? "var(--accent)"
        : strength >= 2
          ? "#f97316"
          : "#ef4444";

  const strengthLabel =
    strength >= 4
      ? "Strong"
      : strength >= 3
        ? "Good"
        : strength >= 2
          ? "Fair"
          : "Weak";

  return (
    <SectionCard
      title="Security"
      subtitle="Change your account password"
      icon={Shield}
    >
      <form onSubmit={onSubmit} noValidate>
        <PasswordField
          fieldKey="current"
          label="Current Password"
          placeholder="Enter current password"
          form={form}
          setForm={setForm}
          errors={errors}
          show={show}
          setShow={setShow}
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <PasswordField
            fieldKey="newPass"
            label="New Password"
            placeholder="Min. 6 characters"
            form={form}
            setForm={setForm}
            errors={errors}
            show={show}
            setShow={setShow}
          />
          <PasswordField
            fieldKey="confirm"
            label="Confirm New Password"
            placeholder="Repeat new password"
            form={form}
            setForm={setForm}
            errors={errors}
            show={show}
            setShow={setShow}
          />
        </div>

        {/* Strength bar */}
        {form.newPass && (
          <div style={{ marginBottom: 14, marginTop: -4 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 99,
                    background: strength >= i ? strengthColor : "var(--border)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, color: strengthColor, fontWeight: 500 }}>
              {strengthLabel} password
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            loading={saving}
            style={{ paddingInline: 20, background: "#8b5cf6", color: "#fff" }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.background = "#7c3aed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#8b5cf6";
            }}
          >
            <Lock size={13} /> Change Password
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── DangerZone ────────────────────────────────────────
function DangerZone({ onLogout }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#ef4444",
            marginBottom: 2,
          }}
        >
          Sign Out
        </p>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          Log out of your Lockr account on this device
        </p>
      </div>
      <button
        onClick={onLogout}
        style={{
          padding: "8px 18px",
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 500,
          border: "1px solid rgba(239,68,68,0.4)",
          background: "rgba(239,68,68,0.06)",
          color: "#ef4444",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.14)";
          e.currentTarget.style.borderColor = "#ef4444";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function Settings() {
  const { user, setUser, logout } = useAuth();

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-1)",
            marginBottom: 3,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          Manage your account, preferences and security
        </p>
      </div>

      <ProfileSection user={user} onUpdate={(u) => setUser(u)} />
      <PreferencesSection user={user} onUpdate={(u) => setUser(u)} />
      <SecuritySection />
      <DangerZone onLogout={logout} />
    </div>
  );
}
