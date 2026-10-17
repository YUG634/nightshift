import { BoardCard, Thread, ReasoningEntry } from '../types';

export const INITIAL_ALERT_CARD: BoardCard = {
  id: 'ALT-501',
  code: 'ALT-501',
  title: 'Error rate spike',
  subtitle: 'Checkout API · HTTP 504 Gateway Timeouts exceeded 42%',
  tag: 'INC-8802 · CRITICAL',
  kind: 'alert',
  x: 0,
  y: 0,
  timestamp: '2026-10-15T10:18Z',
  meta: 'SRE-ONCALL-PAGE',
  isAlert: true,
  pinColor: 'crimson',
};

// In step 2+, the cards are pinned in sequence across the board
export const INVESTIGATION_CARDS: BoardCard[] = [
  {
    id: 'ALT-501',
    code: 'ALT-501',
    title: 'Error rate spike',
    subtitle: 'Checkout API · 504 Timeouts',
    tag: 'INC-8802 · CRITICAL',
    kind: 'alert',
    x: 3.4,
    y: -0.7,
    timestamp: '2026-10-15T10:18Z',
    meta: 'P99 LATENCY > 8200ms',
    isAlert: true,
    pinColor: 'crimson',
  },
  {
    id: 'SRV-CHECKOUT',
    code: 'SRV-CHECKOUT',
    title: 'Checkout API',
    subtitle: 'Production Tier-1 Payment Ingestion',
    tag: 'PROD · CLUSTER-US-EAST',
    kind: 'service',
    x: 1.8,
    y: 1.4,
    timestamp: '2026-10-15T10:15Z',
    meta: 'ACTIVE PODS: 64/64',
    pinColor: 'cyan',
  },
  {
    id: 'DEP-104',
    code: 'DEP-104',
    title: 'v2.4.1 → Checkout API',
    subtitle: 'Canary rollout 100% completed',
    tag: 'DEPLOYED · PROD',
    kind: 'deployment',
    x: -0.2,
    y: -1.2,
    timestamp: '2026-10-15T10:00Z (18m prior)',
    meta: 'PIPELINE #8921',
    pinColor: 'cyan',
  },
  {
    id: 'COMMIT-9a1b',
    code: 'COMMIT-9a1b',
    title: 'Add retry middleware',
    subtitle: 'Exponential backoff with jitter on upstream auth',
    tag: 'GIT: 9a1b7e4',
    kind: 'commit',
    x: -2.0,
    y: 1.2,
    author: 'Bob <bob@corp.internal>',
    timestamp: '2026-10-15T09:42Z',
    meta: '+142 lines / -18 lines',
    pinColor: 'cyan',
  },
  {
    id: 'PR-402',
    code: 'PR-402',
    title: 'Upgrade Auth SDK',
    subtitle: 'Includes retry wrapper for token verification',
    tag: 'MERGED · PR #402',
    kind: 'pr',
    x: -3.8,
    y: -0.6,
    author: 'Bob <bob@corp.internal>',
    timestamp: '2026-10-15T09:55Z',
    meta: 'REVIEW: LGTM (Automated)',
    pinColor: 'cyan',
  },
];

// Sequence of cards to add during Step 2 (after the starting alert card)
export const STEP2_SEQUENCE = [
  {
    cardId: 'SRV-CHECKOUT',
    reasoning: '▸ Tracing from ALT-501...',
    threadFrom: 'ALT-501',
    threadTo: 'SRV-CHECKOUT',
  },
  {
    cardId: 'DEP-104',
    reasoning: '▸ Found deployment DEP-104 (18 min before alert)',
    threadFrom: 'SRV-CHECKOUT',
    threadTo: 'DEP-104',
  },
  {
    cardId: 'COMMIT-9a1b',
    reasoning: '▸ Deployment includes commit 9a1b',
    threadFrom: 'DEP-104',
    threadTo: 'COMMIT-9a1b',
  },
  {
    cardId: 'PR-402',
    reasoning: '▸ Commit belongs to PR #402 — merged by Bob',
    threadFrom: 'COMMIT-9a1b',
    threadTo: 'PR-402',
  },
  {
    cardId: '',
    reasoning: '▸ Evaluating hypotheses...',
    threadFrom: '',
    threadTo: '',
  },
];

export const INITIAL_THREADS: Thread[] = [
  { from: 'ALT-501', to: 'SRV-CHECKOUT', active: false },
  { from: 'SRV-CHECKOUT', to: 'DEP-104', active: false },
  { from: 'DEP-104', to: 'COMMIT-9a1b', active: false },
  { from: 'COMMIT-9a1b', to: 'PR-402', active: false },
];

export const POSTMORTEM_CARD: BoardCard = {
  id: 'POSTMORTEM-INC8802',
  code: 'CASE-8802',
  title: 'INC-8802 · Postmortem',
  subtitle: 'Root cause: PR #402 · Resolved.',
  tag: 'WARRANT ISSUED · POSTMORTEM COMMITTED',
  kind: 'postmortem',
  x: 0,
  y: -0.1,
  timestamp: '2026-10-15T10:30Z',
  meta: 'ACTION: ROLLBACK v2.4.1 EXECUTED',
  pinColor: 'crimson',
};

export const CYPHER_QUERY = `MATCH (p:PullRequest {id:'PR-402'})-[:CONTAINS]->(c:Commit)
      -[:INCLUDED_IN]->(d:Deployment {id:'DEP-104'})
      -[:DEPLOYS]->(s:Service {id:'SRV-CHECKOUT'})
RETURN p, c, d, s`;

export const VERDICT_DATA = {
  incidentId: 'INC-8802',
  hypothesis: 'Unvetted retry middleware added in PR #402 caused the Checkout timeout.',
  status: 'CONFIRMED',
  conviction: '95%',
  proofPath: ['PR-402', 'COMMIT-9a1b', 'DEP-104', 'SRV-CHECKOUT', 'ALT-501'],
  culprit: 'PR #402',
  author: 'Bob',
  deltaT: '18 minutes prior to incident',
};

export const SCRIPTED_RESPONSES: Record<string, string> = {
  default: "It added retry middleware that wasn't vetted against the Checkout timeout budget. It merged 18 minutes before ALT-501 fired.",
  "who approved it?": "PR #402 bypassed peer review via automated branch protection override (bot bypass flag active). Bob merged it directly to main.",
  "what's the fix?": "Immediate rollback of DEP-104 to v2.4.0, followed by setting retry budget ceiling to max 2 attempts with a 400ms hard deadline in Auth SDK.",
  "what is the blast radius?": "Estimated 14,200 checkout transactions aborted during the 18-minute window. Upstream auth service connection pool reached 100% saturation.",
};
