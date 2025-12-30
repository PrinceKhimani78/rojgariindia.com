const InputBox = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder=" "
        className={`
          peer w-full px-4 pt-6 pb-2 rounded-xl bg-white
          border outline-none transition-all
          ${error ? "border-red-500" : "border-gray-300"}
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A]
        `}
      />

      <label
        className={`
          absolute left-4 px-1 bg-white text-gray-500 pointer-events-none
          transition-all duration-150
          top-1/2 -translate-y-1/2
          peer-focus:top-1 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-[#72B76A]
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#72B76A]
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputBox;
