const SelectBox = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          peer w-full px-4 pr-10 pt-6 pb-2 rounded-xl bg-white
          border outline-none transition-all appearance-none
          ${error ? "border-red-500" : "border-gray-300"}
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
        `}
      >
        <option value="" disabled hidden></option>

        {options.map((op, i) => (
          <option key={i} value={op}>
            {op}
          </option>
        ))}
      </select>

      {/* Outline caret arrow */}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      <label
        className="
    absolute left-4 -top-2 px-1
    bg-white text-sm text-gray-500
    peer-focus:text-[#72B76A]
    pointer-events-none
  "

        // className={`
        //   absolute left-4 px-1 bg-white pointer-events-none
        //   transition-all duration-150
        //   ${
        //     value
        //       ? "top-1 -translate-y-1/2 text-sm text-[#72B76A]"
        //       : "top-1/2 -translate-y-1/2 text-base text-gray-400"
        //   }
        //   peer-focus:top-1
        //   peer-focus:-translate-y-1/2
        //   peer-focus:text-sm
        //   peer-focus:text-[#72B76A]
        // `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectBox;
