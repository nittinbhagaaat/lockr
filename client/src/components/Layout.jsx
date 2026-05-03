import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  PiggyBank,
  Target,
  BarChart2,
  LogOut,
  Lock,
  Menu,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/income", icon: TrendingUp, label: "Income" },
  { to: "/savings", icon: PiggyBank, label: "Savings" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      style={{ display: "flex", minHeight: "100dvh", background: "var(--bg)" }}
    >
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          width: collapsed ? 64 : 220,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease, transform 0.2s ease",
          // Mobile: slide in/out
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
        className={!mobileOpen ? "max-md:hidden" : ""}
      >
        {/* Logo row */}
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 16px" : "0 16px",
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Lock size={13} color="var(--accent-fg)" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--text-1)",
                }}
              >
                Lockr
              </span>
            </div>
          )}
          {collapsed && (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={13} color="var(--accent-fg)" strokeWidth={2.5} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
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
                transition: "color 0.15s",
              }}
            >
              <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} />
            </button>
          )}
          {collapsed && <div />}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              margin: "8px auto 0",
              width: 32,
              height: 28,
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--accent)" : "var(--text-2)",
                background: isActive
                  ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                  : "transparent",
                transition: "all 0.15s",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.background = "var(--bg-input)";
                  e.currentTarget.style.color = "var(--text-1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-2)";
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    style={{
                      flexShrink: 0,
                      color: isActive ? "var(--accent)" : "inherit",
                    }}
                  />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — user + logout */}
        <div
          style={{
            padding: "10px 8px 14px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {/* User info */}
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 8,
                marginBottom: 4,
                background: "var(--bg-input)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--accent-fg)",
                  }}
                >
                  {initials}
                </span>
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: collapsed ? "10px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "var(--text-3)",
              fontSize: 13.5,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-3)";
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? 64 : 220,
          transition: "margin-left 0.2s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
        className="max-md:ml-0"
      >
        {/* Topbar */}
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-card)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Menu size={16} />
          </button>

          {/* Mobile logo */}
          <div
            className="md:hidden"
            style={{ display: "flex", alignItems: "center", gap: 7 }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={12} color="var(--accent-fg)" strokeWidth={2.5} />
            </div>
            <span
              style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}
            >
              Lockr
            </span>
          </div>

          {/* Desktop — spacer */}
          <div className="max-md:hidden" />

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hi)";
                e.currentTarget.style.color = "var(--text-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-2)";
              }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--accent-fg)",
                }}
              >
                {initials}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .max-md\\:hidden { display: none !important; }
          .max-md\\:ml-0 { margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .md\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
