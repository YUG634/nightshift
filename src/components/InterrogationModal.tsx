import React, { useState, useEffect, useRef } from 'react';
import { CYPHER_QUERY, SCRIPTED_RESPONSES } from '../data/mockData';

interface InterrogationModalProps {
  onClose: () => void;
  onViewVerdict: () => void;
}

interface DialogueTurn {
  sender: 'user' | 'agent';
  text: string;
}

export const InterrogationModal: React.FC<InterrogationModalProps> = ({
  onClose,
  onViewVerdict,
}) => {
  const [messages, setMessages] = useState<DialogueTurn[]>([
    { sender: 'user', text: 'Why did PR #402 cause the incident?' },
  ]);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCypher, setShowCypher] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fullAgentInitialResponse =
    "It added retry middleware that wasn't vetted against the Checkout timeout budget. It merged 18 minutes before ALT-501 fired.";

  // Typewriter effect for initial agent response
  useEffect(() => {
    let index = 0;
    setCurrentTypingText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      index++;
      setCurrentTypingText(fullAgentInitialResponse.slice(0, index));
      if (index >= fullAgentInitialResponse.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentTypingText, showCypher]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal.trim();
    setInputVal('');

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    // Match scripted response
    const normalized = userText.toLowerCase();
    let reply = SCRIPTED_RESPONSES.default;
    for (const key of Object.keys(SCRIPTED_RESPONSES)) {
      if (key !== 'default' && normalized.includes(key.replace('?', ''))) {
        reply = SCRIPTED_RESPONSES[key];
        break;
      }
    }
    if (reply === SCRIPTED_RESPONSES.default && normalized.includes('who')) {
      reply = SCRIPTED_RESPONSES['who approved it?'];
    } else if (reply === SCRIPTED_RESPONSES.default && (normalized.includes('fix') || normalized.includes('rollback'))) {
      reply = SCRIPTED_RESPONSES["what's the fix?"];
    } else if (reply === SCRIPTED_RESPONSES.default && (normalized.includes('blast') || normalized.includes('impact') || normalized.includes('users'))) {
      reply = SCRIPTED_RESPONSES['what is the blast radius?'];
    }

    // Typewriter for follow-up reply
    setIsTyping(true);
    let charIdx = 0;
    const targetReply = reply;
    setCurrentTypingText('');

    const followUpTimer = setInterval(() => {
      charIdx++;
      setCurrentTypingText(targetReply.slice(0, charIdx));
      if (charIdx >= targetReply.length) {
        clearInterval(followUpTimer);
        setIsTyping(false);
        setMessages((prev) => [...prev, { sender: 'agent', text: targetReply }]);
        setCurrentTypingText('');
      }
    }, 16);
  };

  return (
    <div className="w-[520px] max-w-[calc(100vw-32px)] bg-[#0E1420] border-t-2 border-[#3FB9C9] border-x border-b border-[#1E2838] shadow-[0_24px_50px_rgba(0,0,0,0.85)] flex flex-col pointer-events-auto transition-transform duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1C2638] bg-[#0A0E18]">
        <div>
          <div className="font-mono text-[9px] text-[#3FB9C9] tracking-widest uppercase">
            CHANNEL: SECURE · SUBJECT
          </div>
          <h2 className="font-serif text-[18px] text-[#E8E6E0] font-semibold leading-tight">
            PR #402
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#6B7A99] hover:text-[#E8E6E0] transition-colors p-1 cursor-pointer font-mono text-base"
          title="Close Interrogation"
        >
          ✕
        </button>
      </div>

      {/* BODY / DIALOGUE */}
      <div
        ref={chatScrollRef}
        className="p-5 max-h-[380px] overflow-y-auto space-y-4 font-sans text-sm select-text scrollbar-thin scrollbar-thumb-[#1C2638]"
      >
        {/* Initial user query */}
        <div className="flex flex-col items-end">
          <span className="font-mono text-[9px] text-[#6B7A99] tracking-wider uppercase mb-1">
            YOU
          </span>
          <div className="bg-[#182333] border border-[#27354A] px-3.5 py-2 text-[#E8E6E0] text-[13px] rounded-[1px] max-w-[90%]">
            Why did PR #402 cause the incident?
          </div>
        </div>

        {/* Initial agent response (with typewriter or full text) */}
        <div className="flex flex-col items-start">
          <span className="font-mono text-[9px] text-[#3FB9C9] tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB9C9]" />
            NIGHTSHIFT AGENT
          </span>
          <div className="font-serif text-[14.5px] leading-relaxed text-[#D2D6DF] bg-[#121A28] border-l-2 border-[#3FB9C9] p-3.5 rounded-[1px] w-full">
            {isTyping && messages.length === 1 ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#3FB9C9] animate-pulse align-middle" />
              </span>
            ) : (
              <span>{fullAgentInitialResponse}</span>
            )}
          </div>
        </div>

        {/* Subsequent chat turns */}
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <span
              className={`font-mono text-[9px] tracking-wider uppercase mb-1 ${
                msg.sender === 'user' ? 'text-[#6B7A99]' : 'text-[#3FB9C9]'
              }`}
            >
              {msg.sender === 'user' ? 'YOU' : 'NIGHTSHIFT AGENT'}
            </span>
            <div
              className={`px-3.5 py-2 rounded-[1px] text-[13px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#182333] border border-[#27354A] text-[#E8E6E0] max-w-[90%]'
                  : 'font-serif text-[14.5px] text-[#D2D6DF] bg-[#121A28] border-l-2 border-[#3FB9C9] w-full'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Follow up typing indicator */}
        {isTyping && messages.length > 1 && (
          <div className="flex flex-col items-start">
            <span className="font-mono text-[9px] text-[#3FB9C9] tracking-wider uppercase mb-1">
              NIGHTSHIFT AGENT
            </span>
            <div className="font-serif text-[14.5px] text-[#D2D6DF] bg-[#121A28] border-l-2 border-[#3FB9C9] p-3.5 rounded-[1px] w-full">
              <span>
                {currentTypingText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#3FB9C9] animate-pulse align-middle" />
              </span>
            </div>
          </div>
        )}

        {/* Collapsible Cypher Block */}
        <div className="pt-2">
          <button
            onClick={() => setShowCypher((prev) => !prev)}
            className="flex items-center gap-1.5 font-mono text-[10px] text-[#3FB9C9] hover:text-[#56dce0] tracking-wider uppercase cursor-pointer"
          >
            <span>{showCypher ? '▾' : '▸'}</span>
            <span>{showCypher ? 'HIDE CYPHER' : 'SHOW CYPHER'}</span>
          </button>

          {showCypher && (
            <div className="mt-2 p-3 bg-[#080C14] border border-[#1A2436] rounded-[1px] font-mono text-[11px] leading-relaxed text-[#93A1B8] overflow-x-auto">
              <pre className="whitespace-pre">{CYPHER_QUERY}</pre>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: Quick inquiries & Input & Verdict Button */}
      <div className="p-4 border-t border-[#1C2638] bg-[#0A0E18] space-y-3">
        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-2">
          {["Who approved it?", "What's the fix?", "What is the blast radius?"].map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isTyping}
                onClick={() => {
                  setInputVal(suggestion);
                }}
                className="font-mono text-[9px] text-[#6B7A99] hover:text-[#3FB9C9] border border-[#1F2C40] hover:border-[#3FB9C9]/50 px-2 py-0.5 rounded-[1px] transition-colors cursor-pointer disabled:opacity-50"
              >
                + {suggestion}
              </button>
            )
          )}
        </div>

        {/* Question form input */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            placeholder="Ask another question…"
            className="flex-1 bg-[#121A28] border border-[#223046] focus:border-[#3FB9C9] px-3 py-1.5 font-sans text-xs text-[#E8E6E0] placeholder-[#505D75] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="px-3.5 py-1.5 bg-[#3FB9C9] hover:bg-[#4dd3e4] text-[#0A0E1A] font-mono text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(63,185,201,0.25)]"
          >
            SEND
          </button>
        </form>

        {/* View Verdict CTA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onViewVerdict}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3FB9C9] hover:bg-[#4dd3e4] text-[#0A0E1A] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-[0_0_20px_rgba(63,185,201,0.35)] active:translate-y-px"
          >
            <span>VIEW VERDICT</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
