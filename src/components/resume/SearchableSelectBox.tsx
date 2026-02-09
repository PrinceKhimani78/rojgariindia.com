"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

interface SearchableSelectBoxProps {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Emulating input event for compatibility
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync searchTerm with value prop changes (e.g., when parent resets form or value selected)
    useEffect(() => {
        setSearchTerm(value || "");
    }, [value]);

    // Update filtered options when options prop or searchTerm changes
    useEffect(() => {
        if (!searchTerm) {
            setFilteredOptions(options);
        } else {
            const lower = searchTerm.toLowerCase();
            // If the current search term EXACTLY matches the currently selected value, show all options
            // This allows the user to click the dropdown and see list even if value is selected
            if (value && searchTerm === value) {
                setFilteredOptions(options);
                return;
            }

            const filtered = options.filter((opt) =>
                opt.toLowerCase().includes(lower)
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                // On blur, if the typed text isn't a valid option, revert to previous valid value or clear?
                // Requirement: Strict selection (except for 'Other' in parent logic, but this component should just ensure valid click).
                // Best UX: If text doesn't match EXACTLY an option, revert to `value` prop.
                if (value !== searchTerm) {
                    // Check if searchTerm IS an option (case insensitive match maybe?)
                    const match = options.find(o => o.toLowerCase() === searchTerm.toLowerCase());
                    if (match) {
                        // If it's a match but just case difference, fire change
                        notifyChange(match);
                    } else {
                        // Revert to prop value
                        setSearchTerm(value || "");
                    }
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value, searchTerm, options]);

    const notifyChange = (newValue: string) => {
        // Create a synthetic event
        const event = {
            target: {
                name: name,
                value: newValue,
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    };

    const handleSelect = (option: string) => {
        setSearchTerm(option);
        notifyChange(option);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);

        // For "Other" logic: if "Other" is typed manually? No, usually text input is separate.
        // If strict selection is required, we don't fire onChange with partial text?
        // BUT the requirements say "User cannot type free text initially... Must match list item".
        // However, for the "Other" logic, the PARENT will handle "Other" value.

        // If we only fire onChange on CLICK, validation might fail until click.
        // IF we fire onChange on every Type, parent validation might complain "invalid value".
        // Let's fire clear event if empty.
        if (e.target.value === "") {
            notifyChange("");
        }
    };

    const handleFocus = () => {
        if (!disabled) setIsOpen(true);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name} // Needed for some form libs, but we use controlled
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
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
                    //         className={`absolute left-4 px-1 bg-white text-gray-500 pointer-events-none
                    // transition-all duration-150
                    // top-1/2 -translate-y-1/2
                    // peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-[#72B76A]
                    // peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                    // peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#72B76A]
                    // ${value || searchTerm ? "top-1 -translate-y-1/2 text-sm text-[#72B76A]" : ""}
                    // `}
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
                                key={idx}
                                onClick={() => handleSelect(option)}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm ${option === value ? "bg-green-50 text-[#72B76A] font-medium" : ""}`}
                            >
                                {option}
                            </li>
                        ))
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
