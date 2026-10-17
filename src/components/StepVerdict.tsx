import React from 'react';
import { VerdictPanel } from './VerdictPanel';

interface StepVerdictProps {
  onIssueWarrant: () => void;
  isWarrantIssued: boolean;
  onReset: () => void;
}

export const StepVerdict: React.FC<StepVerdictProps> = ({
  onIssueWarrant,
  isWarrantIssued,
  onReset,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between p-8 overflow-hidden">
      {/* CASE CLOSED stamp that animates onto the board when warrant is clicked */}
      {isWarrantIssued && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pr-64">
          <div className="case-closed-stamp select-none pointer-events-none border-4 border-[#E5484D]/90 px-8 py-3 rounded-[2px] bg-[#E5484D]/10 backdrop-blur-[1px] shadow-[0_0_30px_rgba(229,72,77,0.35)]">
            <div className="border border-[#E5484D]/80 px-6 py-2 text-center">
              <span className="font-serif text-5xl md:text-6xl font-black text-[#E5484D] tracking-[0.2em] uppercase leading-none block">
                CASE CLOSED
              </span>
              <span className="font-mono text-[10px] text-[#E5484D] tracking-widest uppercase mt-1 block font-bold">
                INCIDENT 8802 RESOLVED · SRE WARRANT EXECUTED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top minimal header indicator */}
      <div className="flex items-center gap-3 self-start">
        <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
        <span className="font-mono text-[11px] text-[#A0AEC0] tracking-widest uppercase">
          NIGHTSHIFT // STEP 4: VERDICT
        </span>
      </div>

      {/* Right side verdict panel */}
      <div className="self-center ml-auto">
        <VerdictPanel
          onIssueWarrant={onIssueWarrant}
          isWarrantIssued={isWarrantIssued}
          onReset={onReset}
        />
      </div>
    </div>
  );
};
