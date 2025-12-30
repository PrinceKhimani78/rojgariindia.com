"use client";

import { useRef } from "react";

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      <label className="absolute left-4 top-1 -translate-y-1/2 px-1 bg-white text-sm text-gray-700 pointer-events-none z-10">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`
          w-full px-4 pt-6 pb-2 rounded-xl 
          bg-white text-gray-900
          border outline-none transition-all
          ${error ? "border-red-500" : "border-gray-300"}
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
        `}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePicker;
