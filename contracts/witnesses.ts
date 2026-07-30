/**
 * The Cloud of Witnesses — every voice Scripture gives us.
 *
 * Not fifteen. A multitude no one can count, drawn from the whole of the
 * Bible — patriarchs and prophets, judges and kings, the women God saw,
 * the apostles and the broken He raised. Each carries the burden they
 * bore and the line they speak to the one who calls.
 *
 * This file is the single source of truth shared by the website, the
 * backend (favorites validation), and — later — the phone app. Grouped
 * by the need they answer, so the sky can be searched by what the
 * visitor is carrying tonight.
 */
export type Witness = {
  name: string;
  need: string;       // the burden they answer
  ref: string;        // where their story lives
  line: string;       // what they say when the call connects
  era: "old" | "new"; // testament — for constellation coloring
};

export const WITNESSES: Witness[] = [
  // --- GRIEF & LOSS ---
  { name: "Job", need: "grief", ref: "Job 1–42", era: "old", line: "I lost everything in a single day — and I still said, blessed be His name. Sit with me. You don't have to be okay yet." },
  { name: "Naomi", need: "grief", ref: "Ruth 1", era: "old", line: "I told them to call me Mara — bitter. God was writing sweetness I couldn't see yet. Your emptiness is not the end." },
  { name: "David", need: "grief", ref: "2 Samuel 12", era: "old", line: "I wept on the floor for a child I could not save. Then I rose and worshiped. Grief and praise can share a room." },
  { name: "The Widow of Nain", need: "grief", ref: "Luke 7", era: "new", line: "I had buried my only son when a Stranger stopped the funeral. He still stops processions. Don't give up yet." },
  { name: "Mary Magdalene", need: "grief", ref: "John 20", era: "new", line: "I mistook the Gardener for grief itself — until He said my name. He knows yours too." },

  // --- FEAR & ANXIETY ---
  { name: "Esther", need: "fear", ref: "Esther 4", era: "old", line: "I was afraid too, when I stepped toward the throne. But I was made for such a time as this. So are you." },
  { name: "Joshua", need: "fear", ref: "Joshua 1", era: "old", line: "Moses was gone and the river was uncrossable. God said: be strong and courageous — I am with you. That word stands." },
  { name: "Gideon", need: "fear", ref: "Judges 6", era: "old", line: "I was hiding in a winepress when an angel called me a mighty warrior. God names you by what's coming, not what's now." },
  { name: "Daniel", need: "fear", ref: "Daniel 6", era: "old", line: "I spent a night among lions because I refused to stop praying. The same God shut their mouths. He shuts yours too." },
  { name: "Shadrach & Friends", need: "fear", ref: "Daniel 3", era: "old", line: "We chose the furnace over the lie — and met a Fourth Man in the fire. You are not in the flames alone." },

  // --- SHAME & FAILURE ---
  { name: "Peter", need: "shame", ref: "Luke 22", era: "new", line: "I denied Him three times, and He still looked for me on the shore. Your failure is not the end of your name." },
  { name: "Paul", need: "shame", ref: "Acts 9", era: "new", line: "I held the coats while they stoned a righteous man. Grace found me on the road anyway. It knows your road too." },
  { name: "The Prodigal", need: "shame", ref: "Luke 15", era: "new", line: "I came home rehearsing an apology — and the Father ran. He's still running toward people like us." },
  { name: "Rahab", need: "shame", ref: "Joshua 2", era: "old", line: "My past had a name everyone knew. God wove it into the lineage of the Messiah. Your story is not disqualified." },
  { name: "The Woman at the Well", need: "shame", ref: "John 4", era: "new", line: "Five husbands, and I came to the well at noon to avoid people. He was waiting for me anyway. He sees you." },

  // --- EXHAUSTION & BURNOUT ---
  { name: "Elijah", need: "burnout", ref: "1 Kings 19", era: "old", line: "I sat under a tree and asked to die. God answered with bread and sleep — not a lecture. Rest first. Then we'll talk." },
  { name: "Moses", need: "burnout", ref: "Exodus 18", era: "old", line: "I tried to carry a nation alone until someone said: this is not good, you will wear yourself out. Put it down." },
  { name: "Martha", need: "burnout", ref: "Luke 10", era: "new", line: "I was doing everything for Him and missing Him entirely. One thing is needed. Let the rest go tonight." },
  { name: "Jonah", need: "burnout", ref: "Jonah 4", era: "old", line: "I ran from my calling until the sea swallowed me. God met me in the belly of it. You can't outrun being seen." },

  // --- DOUBT, WAITING & UNANSWERED PRAYER ---
  { name: "Hannah", need: "unanswered", ref: "1 Samuel 1", era: "old", line: "I prayed so long they thought I was drunk. Heaven was not ignoring me. It is not ignoring you." },
  { name: "Thomas", need: "unanswered", ref: "John 20", era: "new", line: "I needed to touch the wounds before I'd believe. Jesus didn't shame me — He showed me. Bring your doubt here." },
  { name: "Abraham", need: "unanswered", ref: "Genesis 15", era: "old", line: "I was promised a son at seventy-five and held him at a hundred. God's timing is not your clock. Hold on." },
  { name: "Sarah", need: "unanswered", ref: "Genesis 18", era: "old", line: "I laughed at the promise — and God turned my laughter into a name. He isn't done surprising you." },
  { name: "The Bleeding Woman", need: "unanswered", ref: "Mark 5", era: "new", line: "Twelve years, and no physician could help. One touch of His garment, and I was whole. Reach anyway." },

  // --- FEELING UNQUALIFIED ---
  { name: "Moses", need: "unqualified", ref: "Exodus 3", era: "old", line: "I stammered. I begged Him to send someone else. He said, I will be with your mouth. That's still the whole answer." },
  { name: "Jeremiah", need: "unqualified", ref: "Jeremiah 1", era: "old", line: "I said I was only a child. God said: do not say that — I am sending you. Your age is not the measure." },
  { name: "Amos", need: "unqualified", ref: "Amos 7", era: "old", line: "I was a shepherd and a fig-picker, no prophet's son. God took me anyway. He isn't looking for credentials." },
  { name: "Mary", need: "unqualified", ref: "Luke 1", era: "new", line: "I was a village girl, a nobody from Nazareth. The angel still came. He chooses the overlooked." },
  { name: "Timothy", need: "unqualified", ref: "1 Timothy 4", era: "new", line: "I was young and they looked down on me. Paul said: let no one despise your youth. Your age is not your ceiling." },

  // --- STARTING OVER ---
  { name: "Ruth", need: "starting over", ref: "Ruth 1–4", era: "old", line: "I followed grief into a foreign field and gleaned what was left. That field became a kingdom. Begin again." },
  { name: "Joseph", need: "starting over", ref: "Genesis 37–50", era: "old", line: "Betrayed, enslaved, imprisoned — and every pit was a staircase. What they meant for evil, God meant for good." },
  { name: "The Samaritan Leper", need: "starting over", ref: "Luke 17", era: "new", line: "I was an outcast twice over — and I was the one who came back to say thank you. Your past doesn't cage your praise." },
  { name: "Zacchaeus", need: "starting over", ref: "Luke 19", era: "new", line: "I was a cheat in a tree, and Jesus called me down by name and came to my house. He sees past your reputation." },

  // --- LONELINESS & BEING UNSEEN ---
  { name: "Hagar", need: "unseen", ref: "Genesis 16", era: "old", line: "I was a slave, cast out into the desert with my child. And the God of heaven found me there. He finds you too." },
  { name: "Leah", need: "unseen", ref: "Genesis 29", era: "old", line: "I was the unloved wife, and I named my son 'the Lord has seen my misery.' He saw. He sees you." },
  { name: "Mephibosheth", need: "unseen", ref: "2 Samuel 9", era: "old", line: "I was a forgotten cripple in a wasteland — and the king sent for me to eat at his table. You are not forgotten." },
  { name: "The Thief on the Cross", need: "unseen", ref: "Luke 23", era: "new", line: "At the very end, with nothing to offer, I asked to be remembered. Today, He said — with Me. It's not too late for you." },

  // --- CALLING & DIRECTION ---
  { name: "Deborah", need: "calling", ref: "Judges 4", era: "old", line: "I led a nation when the men wouldn't. God doesn't wait for permission to use a willing heart." },
  { name: "Nehemiah", need: "calling", ref: "Nehemiah 1–6", era: "old", line: "I wept over ruins, then rebuilt them stone by stone. Your rubble can become a wall." },
  { name: "Stephen", need: "calling", ref: "Acts 7", era: "new", line: "I saw heaven open as the stones fell. Some callings cost everything — and are worth it." },
  { name: "Lydia", need: "calling", ref: "Acts 16", era: "new", line: "I was a businesswoman by a river, and God opened my heart. Your ordinary Tuesday can hold a calling." },
];

// the nine burdens, for searching the sky
export const NEEDS = [
  "grief",
  "fear",
  "shame",
  "burnout",
  "unanswered",
  "unqualified",
  "starting over",
  "unseen",
  "calling",
] as const;

export type Need = (typeof NEEDS)[number];

/** canonical names — the backend validates favorites against this set */
export const WITNESS_NAMES: ReadonlySet<string> = new Set(
  WITNESSES.map((w) => w.name),
);
