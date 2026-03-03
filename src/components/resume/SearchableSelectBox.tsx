"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
type SelectOption = {
  label: string;
  value: string;
};

interface SearchableSelectBoxProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (name: string, value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowCustomInput?: boolean;
}

const SearchableSelectBox: React.FC<SearchableSelectBoxProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  placeholder = "Select...",
  disabled = false,
  required = false,
  allowCustomInput = false,
}) => {
  // console.log("OPTIONS RECEIVED:", name, options);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync displayed label when value changes from outside (e.g. form reset)
  useEffect(() => {
    if (!isOpen) {
      const selectedOption = (options || []).find((opt) => opt.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  useEffect(() => {
    setFilteredOptions(options || []);
  }, [options]);
  // Update filtered options when options prop or searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options || []);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const filtered = (options || []).filter((opt: any) => {
      const label = typeof opt === "string" ? opt : opt?.label || "";

      return label.toLowerCase().includes(lower);
    });

    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Restore display text to the selected option's label
        const selectedOption = (options || []).find((opt) => opt.value === value);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else if (allowCustomInput && value) {
          setSearchTerm(value);
        } else {
          setSearchTerm(value || "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options, allowCustomInput]);

  const notifyChange = (newValue: string) => {
    onChange(name, newValue);
  };

  const handleSelect = (option: SelectOption) => {
    setSearchTerm(option.label);
    notifyChange(option.value);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);

    if (e.target.value === "") {
      notifyChange("");
    } else if (allowCustomInput) {
      // In custom input mode, update the value live as the user types
      notifyChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allowCustomInput && searchTerm.trim()) {
      e.preventDefault();
      const match = (options || []).find(
        (opt) => opt.label.toLowerCase() === searchTerm.toLowerCase()
      );
      if (match) {
        notifyChange(match.value);
      } else {
        notifyChange(searchTerm.trim());
      }
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setSearchTerm(""); // clear so all options are visible
      setIsOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={searchTerm || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`peer w-full px-4 pt-6 pb-2 rounded-xl bg-white
                border outline-none transition-all cursor-text
                ${error ? "border-red-500" : "border-gray-300"}
                focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
                disabled:bg-gray-100 disabled:text-gray-400`}
        />

        <label
          className={`absolute left-4 -top-2 px-1 bg-white
  text-sm pointer-events-none
  text-gray-600
  ${value || searchTerm ? "text-[#72B76A]" : ""}
`}
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <FaChevronDown size={12} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}

      {isOpen && !disabled && (
        <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={option.value || idx}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm ${option.value === value ? "bg-green-50" : ""
                  }`}
              >
                {typeof option === "string" ? option : option.label}
              </li>
            ))
          ) : allowCustomInput && searchTerm.trim() ? (
            <li
              className="px-4 py-2 cursor-pointer hover:bg-green-50 text-[#72B76A] text-sm italic"
              onClick={() => {
                notifyChange(searchTerm.trim());
                setIsOpen(false);
              }}
            >
              Use: &quot;{searchTerm.trim()}&quot;
            </li>
          ) : (
            <li className="px-4 py-2 text-gray-400 text-sm italic">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelectBox;
