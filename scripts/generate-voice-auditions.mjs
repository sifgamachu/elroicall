#!/usr/bin/env node

/**
 * Generate El Roi Guide voice auditions with the OpenAI Speech API.
 *
 * Usage:
 *   OPENAI_API_KEY=... node scripts/generate-voice-auditions.mjs
 *
 * Output is intentionally gitignored. Audition the same scripts in `marin`
 * and `cedar` before choosing the production brand voice.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required.");
  process.exit(1);
}

const OUT = path.resolve("app/public/audio/auditions");
await mkdir(OUT, { recursive: true });

const voices = ["marin", "cedar"];
const base = [
  "Speak like a thoughtful person sitting beside someone, not a preacher, therapist, announcer, or customer-service agent.",
  "Sound warm, grounded, emotionally intelligent, and natural.",
  "Use real conversational phrasing and deliberate pauses.",
  "Do not sound theatrical or inspirational by default.",
  "The listener should feel that you are paying attention rather than performing.",
].join(" ");

const scenarios = {
  grief: {
    instructions: `${base} Slow the pace. Lower the energy. Allow quiet between thoughts. Do not brighten the ending.`,
    text: "Take your time. You do not have to make the grief easier for me to hear. There is a story I want to take you to — Job. Not because his story explains your loss. It matters because Scripture lets him hurt, question, and keep speaking to God without pretending the pain is small. Before we go any further, what part of this loss feels hardest tonight?",
  },
  fear: {
    instructions: `${base} Sound steady and reassuring without becoming soothing or overly soft. Keep the pace calm and clear.`,
    text: "You do not have to convince me that you're brave. Tell me what you're afraid might happen. Esther's story begins in a moment where silence feels safer and speaking carries real risk. We can go there if it helps. But first, I want to understand the decision that is actually in front of you.",
  },
  shame: {
    instructions: `${base} Be nonjudgmental and dignifying, but not indulgent. Keep accountability and compassion in the same tone.`,
    text: "We do not need to excuse what happened in order to talk about it without destroying you. Peter's worst night becomes part of his story, but it does not become his entire name. If you're willing, tell me what you keep replaying — and what you wish you could change about it.",
  },
  burnout: {
    instructions: `${base} Use fewer words, slower pacing, and more space. Do not sound energetic. Do not turn rest into another task.`,
    text: "You sound tired in a way sleep alone may not explain. Elijah reaches a place like that in First Kings nineteen. Before God gives him another assignment, the story gives him food, sleep, quiet, and presence. What has been taking more from you than you have left to give?",
  },
  waiting: {
    instructions: `${base} Be comfortable with uncertainty. Do not imply that an answer is right around the corner.`,
    text: "I don't want to give you a quick answer just because the waiting is painful. Hannah's story knows what long prayer can feel like. Thomas's story knows what it is to need more than somebody else's certainty. What have you been asking for that still feels silent?",
  },
  unseen: {
    instructions: `${base} Sound directly attentive and warm. Avoid sentimentality. Let recognition carry the emotion.`,
    text: "There is a reason this line is called El Roi. Hagar is pushed into the desert with very little power, and there she names God the One who sees me. I am not going to pretend I know your whole story from one sentence. Tell me where you have felt invisible lately.",
  },
  direction: {
    instructions: `${base} Sound curious, clear, and thoughtful. Do not sound mystical or as if you know God's private directive for the listener.`,
    text: "I will not tell you that God told me which choice to make. We can slow the decision down together. Nehemiah begins with a burden he cannot shake, then he grieves, prays, asks questions, plans, and acts. What is the decision in front of you — and what part of it feels least clear?",
  },
};

const manifest = [];

for (const voice of voices) {
  for (const [scenario, sample] of Object.entries(scenarios)) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: sample.text,
        instructions: sample.instructions,
        response_format: "wav",
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${voice}/${scenario}: ${response.status} ${body}`);
    }

    const file = `${voice}-${scenario}.wav`;
    await writeFile(path.join(OUT, file), Buffer.from(await response.arrayBuffer()));
    manifest.push({ voice, scenario, file, text: sample.text, instructions: sample.instructions });
    console.log(`wrote ${file}`);
  }
}

await writeFile(
  path.join(OUT, "manifest.json"),
  JSON.stringify({
    disclosure: "All samples are AI-generated voices.",
    generatedAt: new Date().toISOString(),
    model: "gpt-4o-mini-tts",
    auditions: manifest,
  }, null, 2),
);

console.log(`Auditions written to ${OUT}`);
