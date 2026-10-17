import React from 'react';
import { ReasoningLog } from './ReasoningLog';

interface StepInvestigationProps {
  logs: string[];
  isComplete: boolean;
  onContinue: () => void;
}

export const StepInvestigation: React.FC<StepInvestigationProps> = ({
  logs,
  isComplete,
  onContinue,
}) => {
  return (
    <>
      {/* Streaming Agent Reasoning on the Left Edge */}
      <ReasoningLog logs={logs} />

      {/* Top minimal header info */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#3FB9C9] animate-ping" />
          <span className="font-mono text-[11px] text-[#A0AEC0] tracking-widest uppercase">
            NIGHTSHIFT // INVESTIGATION IN PROGRESS
          </span>
        </div>
        <div className="font-mono text-[10px] text-[#6B7A99] tracking-widest uppercase">
          EVIDENCE GRAPH: {logs.length} / 5 NODES TRACED
        </div>
      </div>

      {/* Bottom right hero continue button when cards finish pinning */}
      {isComplete && (
        <div className="absolute bottom-8 right-8 z-30 transition-all duration-300">
          <button
            onClick={onContinue}
            className="group flex items-center gap-2.5 px-6 py-2.5 bg-[#3FB9C9] hover:bg-[#4dd3e4] text-[#0A0E1A] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-[0_0_24px_rgba(63,185,201,0.4)] active:translate-y-px"
          >
            <span>CONTINUE</span>
            <span className="text-sm transition-transform duration-150 group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}
    </>
  );
};
