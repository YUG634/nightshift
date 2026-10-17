import React from 'react';
import { InterrogationModal } from './InterrogationModal';

interface StepInterrogationProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onViewVerdict: () => void;
}

export const StepInterrogation: React.FC<StepInterrogationProps> = ({
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onViewVerdict,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 overflow-hidden">
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#3FB9C9]" />
          <span className="font-mono text-[11px] text-[#A0AEC0] tracking-widest uppercase">
            NIGHTSHIFT // STEP 3: INTERROGATION
          </span>
        </div>
        <div className="font-mono text-[10px] text-[#6B7A99] tracking-widest uppercase">
          TARGET NODE: PR #402 (AUTH SDK UPGRADE)
        </div>
      </div>

      {/* Floating Interrogation Modal at bottom right */}
      {isModalOpen ? (
        <div className="self-end mt-auto transition-transform duration-300">
          <InterrogationModal
            onClose={onCloseModal}
            onViewVerdict={onViewVerdict}
          />
        </div>
      ) : (
        /* If closed, show hero action banner prompting to inspect PR-402 */
        <div className="self-center mb-10 pointer-events-auto">
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0E1522] border border-[#3FB9C9] text-[#3FB9C9] hover:bg-[#3FB9C9] hover:text-[#0A0E1A] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(63,185,201,0.25)]"
          >
            <span>▸ INTERROGATE PR #402</span>
          </button>
        </div>
      )}
    </div>
  );
};
