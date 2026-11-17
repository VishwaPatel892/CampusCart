"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search textbooks, calculators, study tables, cycle gear...",
  onClear,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A855F7]">
        <Search size={18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 bg-[#171326] border border-[#302641] rounded-2xl text-[#F8FAFC] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] focus:shadow-[0_0_18px_-3px_rgba(168,85,247,0.35)] transition shadow-inner"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A1A1AA] hover:text-[#F8FAFC]"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
