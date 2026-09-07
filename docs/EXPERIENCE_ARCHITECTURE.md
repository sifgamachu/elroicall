# El Roi — Experience Architecture

## Product thesis

El Roi should feel less like a Christian AI website and more like a place a person instinctively goes when life is heavy.

The experience is designed around four moments:

```text
ARRIVE
I am carrying something.

  ↓

BE SEEN
Someone understood what I meant.

  ↓

ENTER SCRIPTURE
This biblical story touches the ground I am standing on.

  ↓

RETURN
I can continue without starting my life story over again.
```

Every visible feature should support one of these moments. If it does not, it does not belong in the first experience.

## The Well as architecture

The visual and interaction model is a well, not outer space and not a dashboard.

A well gives the product four useful spatial ideas:

- **edge** — a low-friction place to begin
- **depth** — the conversation becomes more specific as trust is earned
- **meeting place** — Scripture enters after the person is understood
- **return path** — something useful is carried back into ordinary life

The homepage therefore uses a vertical descent rather than a stack of marketing modules.

## First-screen contract

The first screen asks one primary question:

> What are you carrying today?

A visitor can type a private draft immediately or choose a quiet starting shortcut.

Important privacy rule: homepage draft text stays in `sessionStorage` and is not submitted or placed in the URL. `/begin` consumes the draft and shows the AI/privacy/18+/Terms consent gate before submission.

## Conversation sequence

The order is strict:

1. **Your words**
2. **Reflection**
3. **Scripture**
4. **Continuation / call**

Do not shortcut this to `input → Bible character match`.

The reflection must demonstrate understanding before a biblical story is introduced.

## Scripture library strategy

Launch with a smaller, reviewed set rather than an impressive-looking cast.

Current experience shelf:

- Hagar — unseen / displaced
- Job — grief
- Esther — fear / courage
- Peter — shame / restoration
- Elijah — exhaustion
- Hannah — waiting
- Ruth — starting over
- Moses — feeling unqualified
- Joseph — betrayal
- Nehemiah — direction / rebuilding

These stories should graduate into reviewed story packets under `docs/STORY_PACKET_STANDARD.md` before the AI is given broad interpretive freedom.

## Return architecture

The product advantage should become continuity with user control.

Target returning-user decision:

```text
Welcome back.
Last time we were here...

[ Continue there ]
[ Something changed ]
[ Something else ]
```

Target memory model:

- visible to the user
- editable/deletable when backend guarantees exist
- saved only with a clear product reason
- never presented as working before retention/delete semantics are verified

The current homepage shows this as an explicitly labeled design target. It is not a backend promise.

## Monetization rule

Do not interrupt the first emotional loop with a membership pitch.

The first experience should prove usefulness first. Pricing belongs after value delivery and should be treated as a testable product decision.

## Gift loop

A gift is not access to a Bible character. It is a human handoff:

> I do not know what to say to make this easier. I just wanted you to have somewhere to talk. No pressure to use it.

The recipient remains in control of opening, claiming, topic, prayer, and call timing.

## Visual system

Primary visual language:

- deep charcoal / umber
- parchment / warm stone
- bronze / low gold
- water rings / ripples
- shafts of morning light
- architectural grid lines
- generous negative space

Avoid making cosmic imagery, AI spectacle, or religious stock imagery the core brand language.

## Non-negotiable UX principles

- person before product
- understanding before explanation
- Scripture before synthetic spirituality
- no biblical impersonation
- no private revelation claims
- no hidden memory promises
- no raw sensitive text in analytics or URLs
- mobile-first controls
- no dead interaction surfaces
- fewer sections, more experience

## What is intentionally deferred

- realtime voice-provider migration
- full web-chat conversation backend
- editable persistent memory controls
- theological content studio UI

Those require backend/content governance work. The web architecture should make room for them without pretending they already exist.
