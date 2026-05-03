export default function Button({
  children,
  variant = "primary",
  loading = false,
  style: extraStyle,
  ...props
}) {
  const base = {
    height: 40,
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: loading || props.disabled ? "not-allowed" : "pointer",
    opacity: loading || props.disabled ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    transition: "background 0.15s, opacity 0.15s",
    padding: "0 16px",
    whiteSpace: "nowrap",
    ...extraStyle,
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-2)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "rgba(239,68,68,0.1)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.2)",
    },
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (!loading && !props.disabled) {
          if (variant === "primary")
            e.currentTarget.style.background = "var(--accent-hi)";
          if (variant === "ghost")
            e.currentTarget.style.background = "var(--bg-input)";
          if (variant === "danger")
            e.currentTarget.style.background = "rgba(239,68,68,0.18)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary")
          e.currentTarget.style.background = "var(--accent)";
        if (variant === "ghost")
          e.currentTarget.style.background = "transparent";
        if (variant === "danger")
          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 15,
              height: 15,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
          />{" "}
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
