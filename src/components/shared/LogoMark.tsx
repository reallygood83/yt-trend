"use client";

import React from "react";

interface LogoMarkProps {
  size?: number; // pixel size for the square icon
}

// A custom mark combining YouTube play (triangle) with a coin to represent "Bank"
// Uses YouTube brand red (#FF0000) and a gold coin accent.
export function LogoMark({ size = 32 }: LogoMarkProps) {
  const px = `${size}px`;
  return (
    <div
      aria-label="YouTube Bank 로고"
      className="rounded-xl shadow-sm overflow-hidden"
      style={{ width: px, height: px }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <linearGradient id="yb-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="100%" stopColor="#E00000" />
          </linearGradient>
          <linearGradient id="coin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="112" height="112" rx="28" fill="url(#yb-red)" />
        <polygon points="54,40 54,88 92,64" fill="#FFFFFF" />
        <circle cx="36" cy="88" r="16" fill="url(#coin)" stroke="#B8860B" strokeWidth="3" />
        <text x="36" y="93" fontSize="16" fontWeight="700" textAnchor="middle" fill="#6B4F0B">₩</text>
      </svg>
    </div>
  );
}

export default LogoMark;