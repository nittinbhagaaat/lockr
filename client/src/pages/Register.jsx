import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { Lock, Mail, Eye, EyeOff, User, Sun, Moon } from "lucide-react";
import BgIllustrations from "../components/BgIllustrations";

// ── Defined OUTSIDE component so it never remounts on re-render ──
function Field({
  label,
  field,
  icon: Icon,
  type = "text",
  value,
  onChange,
  error,
  rightEl,
}) {
  const onFocus = (e) => {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = error ? "#ef4444" : "var(--border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-1)",
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          size={15}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
            pointerEvents: "none",
          }}
        />
        <input
          type={type}
          name={field}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={
            field === "password"
              ? "new-password"
              : field === "confirm"
                ? "new-password"
                : field === "email"
                  ? "email"
                  : "off"
          }
          style={{
            width: "100%",
            height: 42,
            paddingLeft: 38,
            paddingRight: rightEl ? 42 : 14,
            fontSize: 14,
            borderRadius: 9,
            border: `1px solid ${error ? "#ef4444" : "var(--border)"}`,
            background: "var(--bg-input)",
            color: "var(--text-1)",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
        {rightEl && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

export default function Register() {
  const { register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome to Lockr 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      if (msg.toLowerCase().includes("email"))
        setErrors((p) => ({ ...p, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (
    <button
      type="button"
      onClick={() => setShowPass((p) => !p)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--text-3)",
        display: "flex",
        alignItems: "center",
        padding: 2,
      }}
    >
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <BgIllustrations />

      {/* Topbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={14} color="var(--accent-fg)" strokeWidth={2.5} />
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}
          >
            Lockr
          </span>
        </div>
        <button
          onClick={toggle}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            cursor: "pointer",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </nav>

      {/* Form card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "36px 32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-1)",
                marginBottom: 6,
              }}
            >
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Start your financial journey with Lockr
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <Field
              label="Full name"
              field="name"
              icon={User}
              value={form.name}
              onChange={onChange}
              error={errors.name}
            />
            <Field
              label="Email address"
              field="email"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={onChange}
              error={errors.email}
            />
            <Field
              label="Password"
              field="password"
              icon={Lock}
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              error={errors.password}
              rightEl={eyeBtn}
            />
            <Field
              label="Confirm password"
              field="confirm"
              icon={Lock}
              type={showPass ? "text" : "password"}
              value={form.confirm}
              onChange={onChange}
              error={errors.confirm}
            />

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 9,
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.65 : 1,
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.background = "var(--accent-hi)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid var(--accent-fg)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
              color: "var(--text-3)",
              fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            Already have an account?
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <Link
            to="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 42,
              borderRadius: 9,
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hi)";
              e.currentTarget.style.background = "var(--bg-input)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Sign in instead
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
