"use client";
import React from "react";

const OtpStep = ({ otp, setOtp, onVerify, isVerified }) => {
  return (
    <div>
      <span className="text-gray-700 text-sm font-medium mb-2 block">
        Enter OTP
      </span>

      <input
        type="text"
        placeholder="Enter OTP"
        className="
          w-full border px-4 py-2 text-sm rounded-lg mb-6
          focus:border-[#72B76A] focus:ring-1 focus:ring-[#72B76A] outline-none
        "
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <div className="flex justify-center">
        <button
          onClick={onVerify}
          className="h-12 px-12 bg-[#72B76A] text-white rounded-lg"
        >
          Verify
        </button>
      </div>

      {isVerified && (
        <p className="text-green-600 text-center mt-4">Verified! Closing…</p>
      )}
    </div>
  );
};

export default React.memo(OtpStep);
