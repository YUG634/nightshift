export type Step = 'alert' | 'investigation' | 'interrogation' | 'verdict';

export type CardKind = 'incident' | 'service' | 'deployment' | 'commit' | 'pr' | 'alert' | 'postmortem';

export interface BoardCard {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  tag: string;
  kind: CardKind;
  x: number;
  y: number;
  timestamp?: string;
  author?: string;
  meta?: string;
  isAlert?: boolean;
  pinColor?: 'crimson' | 'cyan';
  pulse?: boolean;
}

export interface Thread {
  from: string;
  to: string;
  active: boolean; // true = active proof path (cyan #3FB9C9), false = grey (#6B7A99)
  animated?: boolean;
}

export interface ReasoningEntry {
  id: string;
  text: string;
  cardIdToReveal: string;
  delayMs: number;
}

export interface ScriptedChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp?: string;
}
