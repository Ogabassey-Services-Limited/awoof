import React from "react";
import Image from "next/image";

interface LogoProps {
  /** "white" for light hero (e.g. blue background), "blue" for light backgrounds */
  color?: "blue" | "white";
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  color = "blue",
  className,
  width = 120,
  height = 32,
}: LogoProps) {
  return color === "blue" ? (
    <Image
      src="/images/awoofLogoMain.png"
      alt="Awoof"
      width={width}
      height={height}
      className={`object-contain ${className ?? ""}`}
      priority
    />
  ) : (
    <Image
      src="/images/awoofLogo.png"
      alt="Awoof"
      width={width}
      height={height}
      className={`object-contain ${className ?? ""}`}
      priority
    />
  );
}
