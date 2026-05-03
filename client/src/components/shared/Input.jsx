export default function Input({ style: extraStyle, ...props }) {
  return (
    <input
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
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...extraStyle,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--accent)";
        e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}
