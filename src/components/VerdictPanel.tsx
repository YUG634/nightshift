import React from 'react';
import { VERDICT_DATA } from '../data/mockData';

interface VerdictPanelProps {
  onIssueWarrant: () => void;
  isWarrantIssued: boolean;
  onReset: () => void;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({
  onIssueWarrant,
  isWarrantIssued,
  onReset,
}) => {
  return (
    <div className="w-[420px] max-w-[calc(100vw-32px)] bg-[#0E1420]/95 border border-[#1E2838] shadow-[0_24px_50px_rgba(0,0,0,0.85)] p-6 flex flex-col pointer-events-auto backdrop-blur-sm transition-opacity duration-500">
      {/* Incident Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1A2333]">
        <div className="font-mono text-[10px] text-[#3FB9C9] tracking-widest uppercase">
          NIGHTSHIFT // VERDICT
        </div>
        <div className="font-mono text-[9px] text-[#6B7A99] tracking-wider uppercase">
          INC-8802
        </div>
      </div>

      {/* Hypothesis Section */}
      <div className="space-y-1.5 mb-5">
        <div className="font-mono text-[10px] text-[#6B7A99] tracking-widest uppercase">
          HYPOTHESIS
        </div>
        <p className="font-serif text-[15px] text-[#E8E6E0] leading-snug font-normal">
          {VERDICT_DATA.hypothesis}
        </p>
      </div>

      {/* Status & Conviction Grid */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-[#0A0E18] border border-[#1A2333] mb-5">
        <div>
          <div className="font-mono text-[9px] text-[#6B7A99] tracking-wider uppercase mb-1">
            STATUS
          </div>
          <div className="font-mono text-sm text-[#3FB9C9] font-bold tracking-wider">
            {VERDICT_DATA.status}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-[#6B7A99] tracking-wider uppercase mb-1">
            CONVICTION
          </div>
          <div className="font-mono text-sm text-[#E8E6E0] font-bold tracking-wider">
            {VERDICT_DATA.conviction}
          </div>
        </div>
      </div>

      {/* Proof Path Sequence */}
      <div className="space-y-2 mb-6">
        <div className="font-mono text-[10px] text-[#6B7A99] tracking-widest uppercase">
          PROOF PATH
        </div>
        <div className="bg-[#0A0E18] border border-[#1A2333] p-3 space-y-2">
          <div className="flex items-center flex-wrap gap-1.5 font-mono text-[11px] text-[#3FB9C9]">
            {VERDICT_DATA.proofPath.map((node, index) => (
              <React.Fragment key={node}>
                <span className="bg-[#121A28] border border-[#232F42] px-2 py-0.5 text-[#E8E6E0]">
                  {node}
                </span>
                {index < VERDICT_DATA.proofPath.length - 1 && (
                  <span className="text-[#3FB9C9] font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="pt-2 border-t border-[#161F2E] font-mono text-[9px] text-[#6B7A99] tracking-wider">
            MERGED 18M PRIOR · TIMEOUT BUDGET OVERRUN
          </div>
        </div>
      </div>

      {/* Crimson Action Button: ISSUE WARRANT */}
      {!isWarrantIssued ? (
        <button
          onClick={onIssueWarrant}
          className="w-full py-3 bg-[#E5484D] hover:bg-[#eb5b60] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-[0_0_24px_rgba(229,72,77,0.4)] active:translate-y-px"
        >
          [ ISSUE WARRANT ]
        </button>
      ) : (
        <div className="space-y-3">
          <div className="w-full py-2.5 bg-[#181F2C] border border-[#E5484D]/60 text-[#E5484D] font-mono text-xs font-bold tracking-widest uppercase text-center select-none shadow-[0_0_15px_rgba(229,72,77,0.2)]">
            ✓ WARRANT ISSUED · CASE CLOSED
          </div>
          <button
            onClick={onReset}
            className="w-full py-1.5 text-[#6B7A99] hover:text-[#E8E6E0] font-mono text-[10px] tracking-widest uppercase transition-colors cursor-pointer text-center"
          >
            ↺ RESTART INVESTIGATION FLOW
          </button>
        </div>
      )}
    </div>
  );
};
