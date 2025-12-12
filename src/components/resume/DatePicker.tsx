const DatePicker = ({ label, name, value, onChange, error }) => {
  return (
    <div className="relative w-full">
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className={`
          peer w-full px-4 pt-6 pb-2 rounded-xl bg-white
          border outline-none transition-all
          ${error ? "border-red-500" : "border-gray-300"}
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]

          /* hide ONLY date text when empty */
          [&::-webkit-datetime-edit-fields-wrapper]:opacity-0
          ${
            value ? "[&::-webkit-datetime-edit-fields-wrapper]:opacity-100" : ""
          }
        `}
      />

      {/* Floating label acting as placeholder */}
      <label
        className={`
          absolute left-4 px-1 bg-white pointer-events-none
          transition-all duration-150
          ${
            value
              ? "top-1 -translate-y-1/2 text-sm text-[#72B76A]"
              : "top-1/2 -translate-y-1/2 text-base text-gray-400"
          }
          peer-focus:top-1
          peer-focus:-translate-y-1/2
          peer-focus:text-sm
          peer-focus:text-[#72B76A]
        `}
      >
        {label}
      </label>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePicker;
