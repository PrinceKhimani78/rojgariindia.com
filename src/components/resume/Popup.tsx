"use client";

import React from "react";

type PopupProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Popup: React.FC<PopupProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5"
      onClick={onClose}
    >
      <div
        className="
          bg-white rounded-2xl shadow-lg 
          p-10 w-full max-w-md relative 
          animate-popup-slide
        "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 text-2xl hover:text-black"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
};

export default Popup;
