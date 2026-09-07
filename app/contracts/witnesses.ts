/**
 * The Cloud of Witnesses — canonical biblical-story index.
 *
 * V2 product rule: these are stories the El Roi Guide may open with a caller.
 * They are not AI personas and they never speak as if the biblical person is
 * literally present. `line` is retained as a legacy-compatible short story
 * summary while the backend migrates to richer reviewed story packets.
 */
export type Witness = {
  name: string;
  need: string;
  ref: string;
  line: string; // third-person guide summary; never first-person roleplay
  era: "old" | "new";
};

export const WITNESSES: Witness[] = [
  // --- GRIEF & LOSS ---
  { name: "Job", need: "grief", ref: "Job 1–42", era: "old", line: "Job loses what cannot be replaced, questions deeply, and keeps bringing his grief before God without pretending it is small." },
  { name: "Naomi", need: "grief", ref: "Ruth 1", era: "old", line: "Naomi returns home carrying bereavement and bitterness; her story gives language to emptiness before restoration becomes visible." },
  { name: "David", need: "grief", ref: "2 Samuel 12", era: "old", line: "David grieves a child he cannot save, showing that lament, helplessness, worship, and continuing life can occupy the same story." },
  { name: "The Widow of Nain", need: "grief", ref: "Luke 7", era: "new", line: "A widowed mother is met in the middle of public grief as Jesus stops a funeral procession and responds to loss with compassion." },
  { name: "Mary Magdalene", need: "grief", ref: "John 20", era: "new", line: "Mary remains near the tomb in tears and does not recognize hope immediately; her story begins with grief being seen and her name being spoken." },

  // --- FEAR & ANXIETY ---
  { name: "Esther", need: "fear", ref: "Esther 4", era: "old", line: "Esther faces a decision where silence feels safer, yet responsibility asks her to act while the risk is still real." },
  { name: "Joshua", need: "fear", ref: "Joshua 1", era: "old", line: "Joshua inherits leadership after Moses and is called toward courage in a moment defined by uncertainty, responsibility, and transition." },
  { name: "Gideon", need: "fear", ref: "Judges 6", era: "old", line: "Gideon begins hidden and doubtful, making his story useful for conversations about fear, identity, reassurance, and reluctant courage." },
  { name: "Daniel", need: "fear", ref: "Daniel 6", era: "old", line: "Daniel continues a faithful practice under threat, offering a story about conviction when consequences are no longer theoretical." },
  { name: "Shadrach & Friends", need: "fear", ref: "Daniel 3", era: "old", line: "Three friends refuse to make safety their highest value, holding conviction without demanding that God guarantee their preferred outcome." },

  // --- SHAME & FAILURE ---
  { name: "Peter", need: "shame", ref: "Luke 22; John 21", era: "new", line: "Peter fails publicly after insisting he would not, then encounters grief, accountability, restoration, and a future not reduced to his worst night." },
  { name: "Paul", need: "shame", ref: "Acts 7–9", era: "new", line: "Paul's story includes participation in persecution before a radical change of direction, making room for responsibility, grace, and transformed purpose." },
  { name: "The Prodigal", need: "shame", ref: "Luke 15", era: "new", line: "Jesus' parable follows a child who rehearses an apology on the way home and a father whose welcome exceeds the child's planned negotiation." },
  { name: "Rahab", need: "shame", ref: "Joshua 2", era: "old", line: "Rahab's past does not exclude her from courage, faith, protection, and a place in the larger biblical story." },
  { name: "The Woman at the Well", need: "shame", ref: "John 4", era: "new", line: "Jesus speaks with a Samaritan woman across social boundaries and knows her complicated history without making humiliation the center of the encounter." },

  // --- EXHAUSTION & BURNOUT ---
  { name: "Elijah", need: "burnout", ref: "1 Kings 19", era: "old", line: "After intense public ministry, Elijah collapses under a tree; the story begins God's response with food, sleep, presence, and quiet before further direction." },
  { name: "Moses", need: "burnout", ref: "Exodus 18", era: "old", line: "Moses tries to carry too much alone until Jethro names the pattern as unsustainable and calls for shared responsibility." },
  { name: "Martha", need: "burnout", ref: "Luke 10", era: "new", line: "Martha's story creates space to examine service, distraction, resentment, presence, and what happens when devotion becomes overload." },
  { name: "Jonah", need: "burnout", ref: "Jonah 4", era: "old", line: "Jonah ends his mission angry and depleted, exposing the gap that can exist between outward obedience, inward resistance, and God's patient questions." },

  // --- DOUBT, WAITING & UNANSWERED PRAYER ---
  { name: "Hannah", need: "unanswered", ref: "1 Samuel 1", era: "old", line: "Hannah prays from prolonged anguish and misunderstood longing, giving language to waiting without treating pain as evidence of weak faith." },
  { name: "Thomas", need: "unanswered", ref: "John 20", era: "new", line: "Thomas asks for evidence after missing what others experienced; Jesus meets the doubt directly rather than requiring him to pretend certainty." },
  { name: "Abraham", need: "unanswered", ref: "Genesis 15", era: "old", line: "Abraham receives a promise and still asks how it can be true, making his story useful for the long distance between promise, question, and fulfillment." },
  { name: "Sarah", need: "unanswered", ref: "Genesis 18", era: "old", line: "Sarah laughs at a promise that sounds impossible, allowing skepticism, delay, surprise, and fulfillment to exist in the same biblical story." },
  { name: "The Bleeding Woman", need: "unanswered", ref: "Mark 5", era: "new", line: "A woman lives with twelve years of illness, expense, and disappointment before the Gospel places her suffering and hope in direct view." },

  // --- FEELING UNQUALIFIED ---
  { name: "Moses", need: "unqualified", ref: "Exodus 3–4", era: "old", line: "Moses answers calling with objections about identity, credibility, and speech, creating a conversation about limitation without pretending confidence comes first." },
  { name: "Jeremiah", need: "unqualified", ref: "Jeremiah 1", era: "old", line: "Jeremiah points to his youth and inexperience when called, opening questions about readiness, authority, fear, and dependence." },
  { name: "Amos", need: "unqualified", ref: "Amos 7", era: "old", line: "Amos does not present himself as a professional prophet; his ordinary work becomes part of a story about unexpected responsibility." },
  { name: "Mary", need: "unqualified", ref: "Luke 1", era: "new", line: "Mary receives an overwhelming calling from an ordinary setting and responds with questions before consent, making room for wonder, risk, and willingness." },
  { name: "Timothy", need: "unqualified", ref: "1 Timothy 4", era: "new", line: "Timothy's youth and perceived limitations become part of Paul's encouragement toward example, discipline, growth, and faithful responsibility." },

  // --- STARTING OVER ---
  { name: "Ruth", need: "starting over", ref: "Ruth 1–4", era: "old", line: "Ruth begins again after bereavement in a place that is not home, moving through ordinary work, loyalty, uncertainty, provision, and new belonging." },
  { name: "Joseph", need: "starting over", ref: "Genesis 37–50", era: "old", line: "Joseph's life repeatedly changes without his permission; his story can open reflection on betrayal, adaptation, responsibility, power, and meaning over time." },
  { name: "The Samaritan Leper", need: "starting over", ref: "Luke 17", era: "new", line: "A healed Samaritan returns in gratitude, offering a brief story about restoration, outsider status, recognition, and what someone does with a changed life." },
  { name: "Zacchaeus", need: "starting over", ref: "Luke 19", era: "new", line: "Zacchaeus moves from reputation and exploitation toward hospitality and restitution after an encounter that reaches his home and his use of money." },

  // --- LONELINESS & BEING UNSEEN ---
  { name: "Hagar", need: "unseen", ref: "Genesis 16", era: "old", line: "Hagar is exploited and displaced, then names God El Roi after being seen in the desert; her story is the theological heart of El Roi Call." },
  { name: "Leah", need: "unseen", ref: "Genesis 29", era: "old", line: "Leah lives inside a painful family structure and repeatedly names her longing to be loved and seen, giving Scripture unusually direct language for relational invisibility." },
  { name: "Mephibosheth", need: "unseen", ref: "2 Samuel 9", era: "old", line: "Mephibosheth lives far from the royal center until David seeks him out, restores property, and gives him a continuing place at the king's table." },
  { name: "The Thief on the Cross", need: "unseen", ref: "Luke 23", era: "new", line: "At the end of his life, a condemned man asks Jesus to remember him; the story confronts assumptions about worth, time, and who can still be seen." },

  // --- CALLING & DIRECTION ---
  { name: "Deborah", need: "calling", ref: "Judges 4", era: "old", line: "Deborah's story brings leadership, discernment, responsibility, courage, and collaboration into a moment when action is required." },
  { name: "Nehemiah", need: "calling", ref: "Nehemiah 1–6", era: "old", line: "Nehemiah begins with news that burdens him, then grieves, prays, plans, asks, organizes, and acts — a useful pattern for turning concern into responsible direction." },
  { name: "Stephen", need: "calling", ref: "Acts 6–7", era: "new", line: "Stephen's service and witness become costly, raising difficult questions about conviction, courage, suffering, and faithfulness without romanticizing danger." },
  { name: "Lydia", need: "calling", ref: "Acts 16", era: "new", line: "Lydia's ordinary work, attentiveness, hospitality, and resources become part of the early church's story, showing calling within everyday vocation and influence." },
];

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

export const WITNESS_NAMES: ReadonlySet<string> = new Set(
  WITNESSES.map((w) => w.name),
);
