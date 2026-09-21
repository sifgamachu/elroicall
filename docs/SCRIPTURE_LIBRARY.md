# Public Scripture library

The homepage previously sent every story-card visitor to an intake form. Visitors can now open ten complete readings without an account, email, phone number, or API call.

## Experience

- `/explore/` offers a daily selection from the existing ten-reading collection, search, theme filters, and bookmarks. The daily selection rotates; it does not imply a newly authored daily article.
- `/explore/:momentId/` contains a KJV excerpt, a linked primary passage, an original story summary, reflection, question, practical action, suggested prayer, sourced fact, and an interactive comprehension question.
- A seven-reading path keeps every reading open. Completion is an explicit action and can be undone; it is not inferred from page views or listening.
- Bookmark and completion buttons persist only known content IDs in this browser. No private answers are collected by the comprehension question. Browser progress does not sync to an account. Storage errors are visible, with the current visit remaining usable.
- Optional narration uses browser speech synthesis and the device’s available English voice. It is not an OpenAI voice preview and does not affect calling voice preferences. Unsupported browsers retain the complete reading. Navigation stops playback, and start/finish watchdogs expose narration failures.
- The AI-guide action carries only the public passage and prompt to the existing intake review and consent flow.
- Account creation is optional and offered for private written notes and calling preferences. No reading is paywalled and no note is automatically saved.

## Content and sources

Short KJV excerpts are identified separately from original companion material. References were checked against the primary Bible text on Bible Gateway:

| Reading | Passage |
| --- | --- |
| Hagar | Genesis 16:6–13 |
| Job | Job 2:11–13 |
| Esther | Esther 4:13–17 |
| Peter | John 21:9–19 |
| Elijah | 1 Kings 19:1–13 |
| Hannah | 1 Samuel 1:9–18 |
| Ruth | Ruth 1:6–18 |
| Moses | Exodus 3:7–12 |
| Joseph | Genesis 50:15–21 |
| Nehemiah | Nehemiah 2:11–18 |

Each entry generates a direct `https://www.biblegateway.com/passage/?search=...&version=KJV` link. Companion reflections do not treat a particular biblical outcome as a guaranteed outcome for every reader. Hagar and Joseph readings do not prescribe returning to harm or restoring unsafe relationships.

## Architecture and validation

The library is static, typed content in `app/src/lib/scripture-library.ts`. Public readings work independently of Auth, phone credentials, scheduled-call readiness, or LLM availability. The page is lazy-loaded. Only deliberate bookmarking/completion touches local storage. No additional analytics service or background calls are introduced.

Six focused tests cover complete content/routes/sources, daily selection and invalid dates, combined search/filter behavior, malformed storage, explicit completion/undo, and lossless narration chunks. Together with existing tests, the application suite contains 89 tests. TypeScript, lint, and the production build are required before release. Actual device audio quality varies and is not established by unit tests.

Technical reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## Signup status at preparation

All four email DNS records are publicly visible. Resend verification has been started and remains pending. Supabase custom SMTP is still off. Aggregate checks showed zero sent messages for this domain and zero accounts created or confirmed in the last day. Do not describe signup as end-to-end verified until SMTP activation and an owner-authorized inbox test succeed.
