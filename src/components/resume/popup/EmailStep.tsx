"use client";
import React from "react";
import { FiMail } from "react-icons/fi";

const EmailStep = ({ email, setEmail, loading, onNext }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-sm font-medium">Email Address</span>
        <FiMail size={18} className="text-gray-700" />
      </div>

      <input
        type="email"
        placeholder="Enter your email"
        className="text-black w-full border border-gray-500 px-4 py-3 text-base rounded-lg mb-6
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A] outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="h-12 px-12 bg-[#72B76A] text-white rounded-lg"
        >
          {loading ? "Sending..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default React.memo(EmailStep);
