import React from "react";

interface LogoProps {
  color?: string;
  className?: string;
}

export default function Logo({ color = "blue", className }: LogoProps) {
  return (
    <span
      className={`font-bold text-xl ${className ?? ""}`}
      style={{ color: color === "blue" ? "#2563eb" : color }}
    >
      Awoof
    </span>
  );
}
