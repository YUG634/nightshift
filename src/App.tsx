import React, { useState, useEffect, useRef } from 'react';
import { Step, BoardCard, Thread } from './types';
import {
  INITIAL_ALERT_CARD,
  INVESTIGATION_CARDS,
  STEP2_SEQUENCE,
  POSTMORTEM_CARD,
} from './data/mockData';
import { EvidenceBoard } from './components/3d/EvidenceBoard';
import { StepAlert } from './components/StepAlert';
import { StepInvestigation } from './components/StepInvestigation';
import { StepInterrogation } from './components/StepInterrogation';
import { StepVerdict } from './components/StepVerdict';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('alert');

  // Board Cards & Threads State
  const [boardCards, setBoardCards] = useState<BoardCard[]>([INITIAL_ALERT_CARD]);
  const [boardThreads, setBoardThreads] = useState<Thread[]>([]);
  const [latestThreadAnimated, setLatestThreadAnimated] = useState<string | null>(null);

  // Step 2 Investigation State
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [investigationComplete, setInvestigationComplete] = useState<boolean>(false);

  // Step 3 Interrogation State
  const [isInterrogationModalOpen, setIsInterrogationModalOpen] = useState<boolean>(true);

  // Step 4 Verdict & Warrant State
  const [isWarrantIssued, setIsWarrantIssued] = useState<boolean>(false);

  // Step transition handlers
  const handleStartInvestigation = () => {
    setCurrentStep('investigation');
    setReasoningLogs([]);
    setInvestigationComplete(false);

    // Initial alert card positioned for investigation graph
    const alertCardInGraph = INVESTIGATION_CARDS.find((c) => c.id === 'ALT-501') || INITIAL_ALERT_CARD;
    setBoardCards([alertCardInGraph]);
    setBoardThreads([]);
  };

  // Step 2: Stream cards and reasoning lines every ~700ms
  useEffect(() => {
    if (currentStep !== 'investigation') return;

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < STEP2_SEQUENCE.length) {
        const item = STEP2_SEQUENCE[stepIndex];

        // Add reasoning line
        setReasoningLogs((prev) => [...prev, item.reasoning]);

        // Pin card if present
        if (item.cardId) {
          const cardToAdd = INVESTIGATION_CARDS.find((c) => c.id === item.cardId);
          if (cardToAdd) {
            setBoardCards((prev) => {
              if (prev.some((c) => c.id === cardToAdd.id)) return prev;
              return [...prev, cardToAdd];
            });
          }
        }

        // Draw thread if present
        if (item.threadFrom && item.threadTo) {
          const threadKey = `${item.threadFrom}->${item.threadTo}`;
          setLatestThreadAnimated(threadKey);
          setBoardThreads((prev) => [
            ...prev,
            {
              from: item.threadFrom,
              to: item.threadTo,
              active: false,
            },
          ]);
        }

        stepIndex++;
      } else {
        clearInterval(interval);
        setInvestigationComplete(true);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [currentStep]);

  // Handle advance from Step 2 to Step 3
  const handleContinueToInterrogation = () => {
    setCurrentStep('interrogation');
    setIsInterrogationModalOpen(true);

    // In Step 3: Highlight the active proof path in cyan (#3FB9C9)
    // Proof Path: ALT-501 -> SRV-CHECKOUT -> DEP-104 -> COMMIT-9a1b -> PR-402
    setBoardThreads((prev) =>
      prev.map((t) => ({
        ...t,
        active: true,
      }))
    );
  };

  // Handle advance from Step 3 to Step 4
  const handleViewVerdict = () => {
    setCurrentStep('verdict');
    setIsInterrogationModalOpen(false);
  };

  // Handle Step 4: Issue Warrant
  const handleIssueWarrant = () => {
    setIsWarrantIssued(true);

    // Pin short postmortem card after a brief beat
    setTimeout(() => {
      setBoardCards((prev) => {
        if (prev.some((c) => c.id === POSTMORTEM_CARD.id)) return prev;
        return [...prev, POSTMORTEM_CARD];
      });
    }, 450);
  };

  // Full Flow Reset
  const handleReset = () => {
    setCurrentStep('alert');
    setBoardCards([INITIAL_ALERT_CARD]);
    setBoardThreads([]);
    setReasoningLogs([]);
    setInvestigationComplete(false);
    setIsInterrogationModalOpen(false);
    setIsWarrantIssued(false);
    setLatestThreadAnimated(null);
  };

  // Compute 3D board dimming factor based on current step
  const dimLevel =
    currentStep === 'alert' || currentStep === 'investigation'
      ? 1.0
      : currentStep === 'interrogation'
      ? 0.6 // Step 3: "The board dims to 60%"
      : isWarrantIssued
      ? 0.35 // Step 4: "The board stays, but dims further"
      : 0.45;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0A0E1A]">
      {/* 3D EVIDENCE BOARD (Hero of Steps 2, 3, and 4) */}
      <EvidenceBoard
        cards={boardCards}
        threads={boardThreads}
        currentStep={currentStep}
        selectedCardId={currentStep === 'interrogation' ? 'PR-402' : null}
        interactiveCardId={currentStep === 'interrogation' ? 'PR-402' : null}
        onCardClick={(cardId) => {
          if (currentStep === 'interrogation' && cardId === 'PR-402') {
            setIsInterrogationModalOpen(true);
          }
        }}
        dimLevel={dimLevel}
        isWarrantIssued={isWarrantIssued}
        latestThreadAnimated={latestThreadAnimated}
      />

      {/* STEP 1: THE ALERT */}
      {currentStep === 'alert' && (
        <StepAlert onInvestigate={handleStartInvestigation} />
      )}

      {/* STEP 2: THE INVESTIGATION */}
      {currentStep === 'investigation' && (
        <StepInvestigation
          logs={reasoningLogs}
          isComplete={investigationComplete}
          onContinue={handleContinueToInterrogation}
        />
      )}

      {/* STEP 3: THE INTERROGATION */}
      {currentStep === 'interrogation' && (
        <StepInterrogation
          isModalOpen={isInterrogationModalOpen}
          onOpenModal={() => setIsInterrogationModalOpen(true)}
          onCloseModal={() => setIsInterrogationModalOpen(false)}
          onViewVerdict={handleViewVerdict}
        />
      )}

      {/* STEP 4: THE VERDICT */}
      {currentStep === 'verdict' && (
        <StepVerdict
          onIssueWarrant={handleIssueWarrant}
          isWarrantIssued={isWarrantIssued}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
