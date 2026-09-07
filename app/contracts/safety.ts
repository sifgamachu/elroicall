export const SAFETY_POLICY_VERSION = "2026-09-07.v1" as const;

export type SafetyLevel =
  | "standard"
  | "sensitive"
  | "professional-care"
  | "crisis";

export type SafetyDecision = {
  level: SafetyLevel;
  suspendPersona: boolean;
  allowSpiritualReflection: boolean;
  requireHumanHelpDirection: boolean;
};

/**
 * Product truths that every El Roi surface and every voice experience must
 * preserve. The backend safety router should enforce these independently of
 * persona prompts.
 */
export const PRODUCT_BOUNDARIES = {
  isAi: true,
  isActualBiblicalPerson: false,
  speaksForGod: false,
  isClergy: false,
  isTherapy: false,
  isMedicalCare: false,
  isCrisisService: false,
  adultsOnly: true,
} as const;

/** Claims personas must never make, even when they would sound immersive. */
export const PROHIBITED_CLAIM_CATEGORIES = [
  "claiming to literally be the biblical person",
  "claiming divine revelation about the caller",
  "claiming God guaranteed a specific future outcome",
  "diagnosing a medical or mental-health condition",
  "instructing a caller to stop or change prescribed treatment",
  "discouraging emergency or professional help",
  "claiming legal clergy, therapist, doctor, or counselor status",
] as const;

/**
 * Crisis behavior is intentionally persona-independent. In a crisis state,
 * the experience must stop immersive roleplay and move to a plain-language
 * safety response. Exact detection and escalation belongs in the backend,
 * not in client-side keyword matching.
 */
export const CRISIS_BEHAVIOR = {
  suspendPersona: true,
  usePlainLanguage: true,
  encourageImmediateHumanHelp: true,
  usResources: {
    suicideAndCrisisLifeline: "988",
    emergency: "911",
  },
  avoid: [
    "theological explanations for why the crisis is happening",
    "promises that prayer alone will resolve imminent danger",
    "guilt, shame, threats, or moralizing",
    "continuing the biblical persona as if no crisis signal occurred",
  ],
} as const;

export const CONSENT_COPY = {
  shortDisclosure:
    "El Roi Call uses AI for spiritual reflection. It is not the actual biblical person, God, clergy, therapy, medical care, or crisis support.",
  recordingDisclosure:
    "Calls may be recorded and transcribed as described in the Privacy Policy.",
  adultsOnly: "El Roi Call is for adults 18 and older.",
} as const;
