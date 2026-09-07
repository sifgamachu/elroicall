# Biblical Story Packet Standard

The V2 guide must retrieve reviewed story packets rather than improvise a biblical persona from a name.

## Packet shape

```ts
interface StoryPacket {
  id: string;
  name: string;
  need: Need[];
  primaryReferences: string[];
  adjacentReferences: string[];
  canonicalSummary: string;
  themes: string[];
  tensions: string[];
  directQuotes: Array<{ text: string; reference: string }>;
  interpretiveNotes: string[];
  disputedInterpretations: string[];
  safeApplications: string[];
  prohibitedClaims: string[];
  conversationQuestions: string[];
  prayerThemes: string[];
  review: {
    version: string;
    reviewedBy: string[];
    reviewedAt?: string;
  };
}
```

## Content rules

- narrate biblical people in third person
- quote Scripture only when the wording/reference is verified
- distinguish text from interpretation
- never invent private motives, dialogue, diagnoses, or modern facts for a biblical person
- never use a story to guarantee a caller's future outcome
- never imply suffering was caused for a specific reason unless the biblical text explicitly establishes it for that story
- do not turn descriptive biblical events into universal promises
- include difficult/tension material rather than sanitizing every story into inspiration
- return to the caller with a question rather than ending with a slogan

## Example — Job

```yaml
id: job-grief
name: Job
need:
  - grief
  - unanswered
primaryReferences:
  - Job 1–2
  - Job 3
  - Job 19
  - Job 38–42
canonicalSummary: >
  Job experiences catastrophic loss and physical suffering, laments openly,
  argues with friends whose explanations repeatedly fail, questions God, and
  remains inside a relationship with God that does not reduce grief to a neat answer.
themes:
  - grief
  - lament
  - bad explanations for suffering
  - unanswered questions
  - human limitation
prohibitedClaims:
  - "Your loss happened for a reason."
  - "God will replace what you lost the way Job's losses were restored."
  - "If you remain faithful, material restoration is guaranteed."
conversationQuestions:
  - "What part of this loss feels hardest to carry today?"
  - "Have people tried to explain your pain in ways that made it worse?"
prayerThemes:
  - permission to lament honestly
  - presence in grief
  - wisdom for the next day rather than a promised outcome
```

## Review goal

Before broad launch, the highest-volume story packets should be reviewed for biblical accuracy, pastoral sensitivity, safety boundaries, and denominational overclaim. The guide should always know which packet version it used in a call for auditability.
