export default function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
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
      )}
      {children}
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}
