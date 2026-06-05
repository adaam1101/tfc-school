import React, { useState } from "react";

export default function StarRating({
  value = 0,
  onChange,
  size = "md",
  readOnly = false
}) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9", xl: "h-12 w-12" };
  const cls = sizes[size] || sizes.md;
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={`transition-all duration-100 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        >
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill={star <= active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            style={{
              color: star <= active ? "#f59e0b" : "#d1d5db",
              filter: star <= active ? "drop-shadow(0 0 3px rgba(245,158,11,0.4))" : "none"
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
