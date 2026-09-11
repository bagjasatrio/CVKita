"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Agu" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Okt" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Des" },
];

interface MonthYearPickerProps {
  value: string; // e.g. "2024-03" or "Present"
  onChange: (val: string) => void;
  label?: string;
  allowPresent?: boolean;
}

export function MonthYearPicker({
  value,
  onChange,
  label,
  allowPresent = false,
}: MonthYearPickerProps) {
  const isPresent = value === "Present" || value === "Masih Bekerja";
  const parts = value && value.includes("-") ? value.split("-") : ["2024", "01"];
  const currentYear = parseInt(parts[0], 10) || 2024;
  const currentMonth = parts[1] || "01";

  const handleMonthChange = (m: string) => {
    onChange(`${currentYear}-${m}`);
  };

  const shiftYear = (delta: number) => {
    const nextY = currentYear + delta;
    onChange(`${nextY}-${currentMonth}`);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block font-medium text-xs text-[#191c1c] dark:text-zinc-200">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {/* Single Unified Input Box */}
        <div className="flex items-center border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#121816] overflow-hidden shadow-xs focus-within:border-orange-500 dark:focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-500 dark:focus-within:ring-orange-400">
          {/* Month Dropdown */}
          <select
            disabled={isPresent}
            value={currentMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-transparent focus:outline-none font-semibold text-[#191c1c] dark:text-zinc-100 border-r border-[#edeeee] dark:border-[#242c2a] cursor-pointer disabled:opacity-40"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100">
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Stepper with Left (<) & Right (>) Click Arrows ONLY */}
          <div className="flex items-center px-1">
            <button
              type="button"
              disabled={isPresent}
              onClick={() => shiftYear(-1)}
              className="p-1 hover:bg-[#f2f4f3] dark:hover:bg-[#1b2220] active:bg-orange-100 dark:active:bg-orange-950 text-[#727976] dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded transition-colors disabled:opacity-40"
              title="Tahun Sebelumnya (-1)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-xs font-bold text-orange-600 dark:text-orange-400 min-w-[44px] text-center select-none">
              {isPresent ? "----" : currentYear}
            </span>

            <button
              type="button"
              disabled={isPresent}
              onClick={() => shiftYear(1)}
              className="p-1 hover:bg-[#f2f4f3] dark:hover:bg-[#1b2220] active:bg-orange-100 dark:active:bg-orange-950 text-[#727976] dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 rounded transition-colors disabled:opacity-40"
              title="Tahun Selanjutnya (+1)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Present Toggle Button */}
        {allowPresent && (
          <button
            type="button"
            onClick={() => onChange(isPresent ? "2026-01" : "Present")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPresent
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-xs"
                : "bg-[#f2f4f3] dark:bg-[#121816] text-[#727976] dark:text-zinc-400 border-[#e1e3e2] dark:border-[#242c2a] hover:bg-[#e7e8e8] dark:hover:bg-[#1b2220]"
            }`}
          >
            {isPresent ? "✓ Present" : "Present"}
          </button>
        )}
      </div>
    </div>
  );
}
