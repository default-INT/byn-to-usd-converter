import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export function Button({
  children,
  variant = "primary",
  style,
  ...rest
}: ButtonProps) {
  const base: CSSProperties = {
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid transparent",
    cursor: rest.disabled ? "not-allowed" : "pointer",
    opacity: rest.disabled ? 0.6 : 1,
  };

  const variants: Record<NonNullable<ButtonProps["variant"]>, CSSProperties> = {
    primary: {
      background: "#1a5f4a",
      color: "#f5faf8",
      borderColor: "#1a5f4a",
    },
    ghost: {
      background: "transparent",
      color: "#1a5f4a",
      borderColor: "#1a5f4a",
    },
  };

  return (
    <button type="button" style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}
