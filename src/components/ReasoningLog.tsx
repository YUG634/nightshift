import React from 'react';

interface ReasoningLogProps {
  logs: string[];
}

export const ReasoningLog: React.FC<ReasoningLogProps> = ({ logs }) => {
  return (
    <div className="absolute top-20 left-6 z-20 pointer-events-none max-w-sm">
      <div className="border-l-2 border-[#3FB9C9]/50 pl-3 py-1 space-y-2.5">
        <div className="font-mono text-[10px] text-[#3FB9C9] tracking-widest uppercase font-semibold">
          AI AGENT TRACE
        </div>
        {logs.map((log, index) => {
          const isLatest = index === logs.length - 1;
          return (
            <div
              key={index}
              className={`font-mono text-[12px] leading-relaxed transition-all duration-300 ${
                isLatest
                  ? 'text-[#E8E6E0] font-semibold drop-shadow-[0_0_8px_rgba(63,185,201,0.5)]'
                  : 'text-[#6B7A99]'
              }`}
            >
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};
