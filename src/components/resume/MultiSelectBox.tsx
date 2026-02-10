"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

interface MultiSelectBoxProps {
    label: string;
    name: string;
    value: string[];
    options: string[];
    onChange: (e: { target: { name: string; value: string[] } }) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}

const MultiSelectBox: React.FC<MultiSelectBoxProps> = ({
    label,
    name,
    value = [],
    options,
    onChange,
    error,
    placeholder = "Select...",
    disabled = false,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(
        (opt) =>
            opt.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !value.includes(opt)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        const newValue = [...value, option];
        onChange({ target: { name, value: newValue } });
        setSearchTerm("");
        // Keep open for more selections? Usually better for UX in multi-select
    };

    const handleRemove = (option: string) => {
        const newValue = value.filter((v) => v !== option);
        onChange({ target: { name, value: newValue } });
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className={`flex flex-wrap gap-2 peer w-full px-4 pt-6 pb-2 rounded-xl bg-white border outline-none transition-all min-h-[58px]
                ${error ? "border-red-500" : "border-gray-300"}
                ${isOpen ? "border-[#72B76A] ring-1 ring-[#72B76A]" : ""}
                ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-text"}`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                {value.map((val) => (
                    <span
                        key={val}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-md border border-green-200"
                    >
                        {val}
                        <FaTimes
                            className="cursor-pointer hover:text-green-900"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(val);
                            }}
                        />
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 min-w-[50px] outline-none bg-transparent text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={value.length === 0 ? placeholder : ""}
                    disabled={disabled}
                />

                <label
                    className={`absolute left-4 -top-2 px-1 bg-white text-sm pointer-events-none transition-all
                    ${(value.length > 0 || isOpen) ? "text-[#72B76A]" : "text-gray-600"}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option);
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm"
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-400 text-sm italic">
                            {searchTerm ? "No results found" : "All items selected"}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default MultiSelectBox;
