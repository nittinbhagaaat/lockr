export default function EmptyState({ icon, title, desc }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        gap: 12,
        color: "var(--text-3)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)" }}>
        {title}
      </p>
      {desc && <p style={{ fontSize: 13, maxWidth: 300 }}>{desc}</p>}
    </div>
  );
}
