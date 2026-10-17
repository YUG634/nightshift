import React, { useState } from 'react';

interface StepAlertProps {
  onInvestigate: (prompt: string) => void;
}

export const StepAlert: React.FC<StepAlertProps> = ({ onInvestigate }) => {
  const [promptText, setPromptText] = useState('Why did the Checkout API break?');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      onInvestigate(promptText.trim());
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Top minimal status indicator */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D] shadow-[0_0_8px_#E5484D]" />
          <span className="font-mono text-[11px] text-[#A0AEC0] tracking-widest uppercase">
            NIGHTSHIFT // INC-8802 ACTIVE
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#718096] tracking-widest uppercase">
          ROOM: COLD-04 · 2026-10-15T10:18Z
        </span>
      </div>

      {/* Bottom single hero prompt input */}
      <div className="w-full flex justify-center pb-8 pointer-events-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl flex items-center bg-[#0D131F]/90 border border-[#232F42] hover:border-[#3FB9C9]/60 focus-within:border-[#3FB9C9] shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-md px-3 py-2 transition-all duration-200"
        >
          <span className="font-mono text-[#3FB9C9] text-sm pl-2 pr-3 select-none">▸</span>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="flex-1 bg-transparent font-mono text-[13px] text-[#E8E6E0] placeholder-[#4A5568] focus:outline-none tracking-wide"
            placeholder="Type incident inquiry..."
            autoFocus
          />
          <button
            type="submit"
            className="ml-3 px-5 py-2 bg-[#3FB9C9] hover:bg-[#4dd3e4] text-[#0A0E1A] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(63,185,201,0.3)] active:translate-y-px"
          >
            INVESTIGATE
          </button>
        </form>
      </div>
    </div>
  );
};
