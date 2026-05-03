export default function Select({ children, style: extraStyle, ...props }) {
  return (
    <select
      {...props}
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
        transition: "border-color 0.15s",
        ...extraStyle,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--accent)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border)";
        props.onBlur?.(e);
      }}
    >
      {children}
    </select>
  );
}
