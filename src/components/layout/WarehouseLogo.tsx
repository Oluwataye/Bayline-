import React from "react";

export function WarehouseLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Warehouse Logo"
    >
      {/* Gable Roof & Warehouse Frame */}
      <path
        d="M24 6L6 18V42H42V18L24 6Z"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizontal Roof Support Line */}
      <path
        d="M6 18H42"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Upper Stacked Box */}
      <rect
        x="19"
        y="21"
        width="10"
        height="9"
        rx="1"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M24 21V26" stroke="white" strokeWidth="1.5" />
      {/* Lower Left Box */}
      <rect
        x="13"
        y="30"
        width="10"
        height="9"
        rx="1"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M18 30V35" stroke="white" strokeWidth="1.5" />
      {/* Lower Right Box */}
      <rect
        x="25"
        y="30"
        width="10"
        height="9"
        rx="1"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M30 30V35" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

