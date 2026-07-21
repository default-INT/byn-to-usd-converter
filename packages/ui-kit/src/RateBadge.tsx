import type { ReactNode } from "react";

export interface RateBadgeProps {
  label: string;
  value: string;
  children?: ReactNode;
}

export function RateBadge({ label, value, children }: RateBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 11, letterSpacing: "0.04em", color: "#5a6b64" }}>
        {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 600, color: "#0f2e24" }}>{value}</span>
      {children}
    </div>
  );
}
