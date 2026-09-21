export type ScriptureMoment = {
  id: string; person: string; need: string; theme: string; title: string; description: string;
  passage: string; verse: string; quote: string; story: string; reflection: string;
  question: string; action: string; prayer: string; fact: string;
  quiz: { question: string; options: string[]; answer: number; explanation: string };
};

// Original summaries and reflections. Quoted excerpts are KJV; each entry links
// directly to its primary passage. Keep application distinct from the Bible text.
export const SCRIPTURE_MOMENTS: ScriptureMoment[] = [
  {
    id: 'hagar', person: 'Hagar', need: 'unseen', theme: 'Feeling unseen', title: 'You have not disappeared.',
    description: 'A woman in the wilderness. A God who notices her.', passage: 'Genesis 16:6-13', verse: 'Genesis 16:13', quote: 'Thou God seest me',
    story: 'Hagar has fled harsh treatment from Sarai. In the wilderness, an angel of the Lord finds her beside a spring and speaks to her by name. Her pain has been heard. Hagar responds by naming the Lord who sees her. This encounter happens far from the household where she has been mistreated.',
    reflection: 'Being overlooked by people can make you question whether you matter at all. This passage gives attention to someone others have treated as a means to an end. You can bring the part of your life that feels invisible into prayer. Hagar’s particular instruction to return is not a blanket instruction to remain in an unsafe situation. Being seen includes taking your safety seriously.',
    question: 'What part of your life do you most wish someone would notice?', action: 'Name that need in one honest sentence. Consider sharing it with a trustworthy person who can support you.',
    prayer: 'God who sees, meet me in the places I struggle to explain. Help me receive care and recognize the dignity you give me. Amen.',
    fact: 'The name El Roi comes from Hagar’s encounter in Genesis 16:13, where she speaks of the God who sees her.',
    quiz: { question: 'Where does the angel find Hagar?', options: ['Beside a spring in the wilderness', 'Inside a palace', 'On a fishing boat'], answer: 0, explanation: 'Genesis 16:7 locates the meeting by a spring on the way to Shur.' },
  },
  {
    id: 'job', person: 'Job', need: 'grief', theme: 'Carrying grief', title: 'You do not have to explain your grief.',
    description: 'Before explanations, there is the gift of presence.', passage: 'Job 2:11-13', verse: 'Job 2:13', quote: 'for they saw that his grief was very great',
    story: 'Three friends hear about Job’s suffering and arrange to visit him. When they see him, they weep. They sit with him on the ground for seven days and nights without speaking. At this moment in the story, they recognize that his pain is too great for a quick answer.',
    reflection: 'Grief can feel especially lonely when everyone wants you to feel better on their timetable. This scene makes room for sorrow without requiring a polished explanation. You do not need to turn loss into a lesson today. And when someone else is grieving, companionship may be more helpful than finding the perfect thing to say.',
    question: 'What would supportive presence look like for you today?', action: 'Ask someone to sit with you, take a quiet walk, or help with one ordinary task. If you are supporting someone, offer something specific.',
    prayer: 'God, I bring you the loss I cannot tidy up. Give me companions who can stay, and help me be gentle with my own heart. Amen.',
    fact: 'Job 2 names the three friends as Eliphaz, Bildad, and Zophar. Their first response includes seven days of silence.',
    quiz: { question: 'What do the friends do in this passage?', options: ['Explain why everything happened', 'Sit with Job in silence', 'Ask Job to lead a celebration'], answer: 1, explanation: 'Job 2:13 describes seven days and seven nights of sitting with him, without speaking.' },
  },
  {
    id: 'esther', person: 'Esther', need: 'fear', theme: 'Finding courage', title: 'Courage can ask for company.',
    description: 'A difficult decision does not have to be carried alone.', passage: 'Esther 4:13-17', verse: 'Esther 4:16', quote: 'Go, gather together all the Jews that are present in Shushan, and fast ye for me',
    story: 'Esther faces a dangerous decision about approaching the king on behalf of her people. Mordecai challenges her to consider her responsibility. Before she acts, she asks the Jewish community in Shushan to gather and fast for three days. She and her attendants will fast too. Her decision is courageous, and it is supported by a community.',
    reflection: 'We sometimes imagine courage as feeling no fear and needing nobody. Esther shows another possibility: face the risk honestly, seek support, and take a considered step. Your situation is not identical to hers, and courage does not require ignoring danger. It can mean asking for wise counsel before speaking or acting.',
    question: 'Who could help you think clearly about the decision in front of you?', action: 'Reach out to one trusted person. Describe the decision and ask for their perspective before taking your next step.',
    prayer: 'God, give me courage joined with wisdom. Help me listen well, ask for support, and act with care for others. Amen.',
    fact: 'Esther asks for three days of communal fasting before she approaches the king in Esther 4:16.',
    quiz: { question: 'What does Esther request before she acts?', options: ['A new crown', 'A public celebration', 'That her community gather and fast'], answer: 2, explanation: 'Her request in Esther 4:16 brings the community into this moment of decision.' },
  },
  {
    id: 'peter', person: 'Peter', need: 'shame', theme: 'Starting again', title: 'There is a next step after failure.',
    description: 'Breakfast, an honest question, and a renewed responsibility.', passage: 'John 21:9-19', verse: 'John 21:16', quote: 'Feed my sheep.',
    story: 'The risen Jesus meets the disciples beside the sea, where bread and fish are ready. After they eat, he asks Peter three times whether Peter loves him. Each time, Jesus gives him a responsibility to care for his lambs or sheep. The conversation ends with the invitation to follow Jesus.',
    reflection: 'Shame can turn an action you regret into a name you give yourself. Here, love is connected to a responsibility Peter can live out. A new beginning need not erase what happened or skip the work of repair. It can begin with honesty, receiving grace, and doing the next faithful thing for someone in your care.',
    question: 'What is one responsible step you can take without pretending the past did not happen?', action: 'Choose one small act of repair: an honest apology, a kept commitment, or practical care for someone you have neglected.',
    prayer: 'Jesus, meet me with truth and grace. Help me take responsibility without losing hope, and teach me to love through my actions. Amen.',
    fact: 'John 21 places Jesus’ conversation with Peter after a meal of bread and fish beside the sea.',
    quiz: { question: 'What responsibility does Jesus give Peter?', options: ['Care for his sheep', 'Build a palace', 'Avoid all other people'], answer: 0, explanation: '“Feed my sheep” appears in John 21:16 and 21:17 as Jesus speaks with Peter about love.' },
  },
  {
    id: 'elijah', person: 'Elijah', need: 'burnout', theme: 'Feeling overwhelmed', title: 'Rest belongs in the story.',
    description: 'Before the next journey: sleep, water, and something to eat.', passage: '1 Kings 19:1-13', verse: '1 Kings 19:7', quote: 'Arise and eat; because the journey is too great for thee.',
    story: 'Under threat, Elijah flees into the wilderness and reaches a point of deep exhaustion. He lies down and sleeps. An angel wakes him to eat, and he finds food and water nearby. He rests again and receives food a second time before the journey continues. Later, at Horeb, he encounters a still small voice.',
    reflection: 'When you have been carrying too much, a demand to try harder may be the last thing you need. Notice the attention to Elijah’s body before his next assignment. Ordinary care can belong within a life of faith. Rest is not a guarantee that every difficulty will disappear; it can be one honest part of receiving the help you need.',
    question: 'Which basic need have you been pushing aside?', action: 'Make room for one small act of care: a meal, water, a pause, or asking someone to share a task.',
    prayer: 'God, you know my limits. Help me receive care, ask for help, and take the next step at a human pace. Amen.',
    fact: 'In 1 Kings 19:5-7, Elijah receives food and rest before his journey to Horeb continues.',
    quiz: { question: 'What is offered to Elijah before he travels onward?', options: ['A larger assignment', 'Food and water', 'A crowd to impress'], answer: 1, explanation: 'The passage describes food, water, sleep, and a second invitation to eat.' },
  },
  {
    id: 'hannah', person: 'Hannah', need: 'unanswered', theme: 'Waiting and hoping', title: 'Prayer does not need polished words.',
    description: 'A quiet prayer can carry something very deep.', passage: '1 Samuel 1:9-18', verse: '1 Samuel 1:15', quote: 'but have poured out my soul before the Lord.',
    story: 'Hannah brings her distress to God at Shiloh. She prays with tears, moving her lips without speaking aloud. Eli misunderstands what he sees. Hannah explains that she is pouring out her soul before the Lord. Eli then speaks a blessing, and she leaves, eats, and is no longer downcast in the same way.',
    reflection: 'You do not have to make your longing sound impressive before you bring it to God. Hannah’s prayer is personal, difficult, and initially misunderstood. Her story invites honesty; it is not a promise that every person will receive the same outcome or on the same timetable. There is room to pray while the future is still uncertain.',
    question: 'What are you tired of trying to explain beautifully?', action: 'Take a quiet minute and speak to God in ordinary language. A single sentence is enough to begin.',
    prayer: 'God, here is what I long for, and here is what I do not understand. Receive my honest prayer and sustain me while I wait. Amen.',
    fact: 'Hannah’s lips move, but her voice is not heard, in 1 Samuel 1:13. Silent prayer is part of this biblical scene.',
    quiz: { question: 'How is Hannah praying when Eli notices her?', options: ['By leading a choir', 'By speaking to a crowd', 'Silently, with her lips moving'], answer: 2, explanation: 'The narrator describes her praying in her heart, with moving lips but no audible voice.' },
  },
  {
    id: 'ruth', person: 'Ruth', need: 'starting-over', theme: 'Starting again', title: 'A new beginning can start with companionship.',
    description: 'The road is uncertain. Ruth chooses to walk with Naomi.', passage: 'Ruth 1:6-18', verse: 'Ruth 1:16', quote: 'for whither thou goest, I will go',
    story: 'Naomi sets out from Moab after the loss of her husband and sons. She urges her daughters-in-law to return to their families. Ruth chooses to remain with her. She commits to Naomi’s people and God, and Naomi sees that Ruth is determined to accompany her. Their next chapter begins with a relationship, not a complete plan.',
    reflection: 'Starting again can make every unknown feel urgent. Ruth’s commitment offers a smaller place to begin: who will you walk with, and what values will you carry? You do not need to solve the whole future today. A trustworthy relationship and a practical next step can give shape to an uncertain season.',
    question: 'Who helps you stay grounded when life changes?', action: 'Make one connection today: a message to a supportive friend, a shared meal, or a conversation with someone in your community.',
    prayer: 'God, meet me on the road ahead. Help me recognize good companions and become a faithful companion to others. Amen.',
    fact: 'Ruth’s words in Ruth 1:16 are spoken to her mother-in-law Naomi. The passage describes family loyalty during loss and transition.',
    quiz: { question: 'To whom does Ruth speak her words of commitment?', options: ['Naomi, her mother-in-law', 'A king', 'A military commander'], answer: 0, explanation: 'Ruth 1:14-18 records the conversation between Ruth and Naomi as Naomi prepares to leave Moab.' },
  },
  {
    id: 'moses', person: 'Moses', need: 'unqualified', theme: 'Finding courage', title: 'You can begin with an honest question.',
    description: '“Who am I?” meets a promise of presence.', passage: 'Exodus 3:7-12', verse: 'Exodus 3:12', quote: 'Certainly I will be with thee',
    story: 'God tells Moses that he has seen the suffering of the Israelites and heard their cries. Moses is sent to Pharaoh to bring the people out of Egypt. Moses responds with a question about who he is to take on such a task. God’s answer centers on being with him, rather than on a list of Moses’ achievements.',
    reflection: 'A responsibility can feel larger than your confidence. In this passage, Moses brings that uncertainty into the conversation rather than hiding it. You can acknowledge what you do not know, prepare carefully, and seek support. Feeling inadequate does not settle the question of what faithful action might look like.',
    question: 'What question would help you understand your next step more clearly?', action: 'Write down one thing you need to learn, and identify a person or resource that can help you learn it.',
    prayer: 'God, be with me in what I do not yet know. Give me humility to learn and courage to take a thoughtful next step. Amen.',
    fact: 'Before Moses receives his assignment, Exodus 3:7 describes God seeing suffering and hearing the people’s cries.',
    quiz: { question: 'What does God emphasize in his answer to Moses?', options: ['Moses’ impressive reputation', 'His presence with Moses', 'That the task is effortless'], answer: 1, explanation: 'Exodus 3:12 begins with the assurance, “Certainly I will be with thee.”' },
  },
  {
    id: 'joseph', person: 'Joseph', need: 'betrayal', theme: 'Healing after hurt', title: 'The harm does not have to be renamed good.',
    description: 'Joseph names the wrong and chooses a different response.', passage: 'Genesis 50:15-21', verse: 'Genesis 50:20', quote: 'ye thought evil against me; but God meant it unto good',
    story: 'After their father’s death, Joseph’s brothers fear that he will repay them for the harm they caused. Joseph weeps when their message reaches him. He tells them that he is not in God’s place. He names their intention as evil and describes God bringing good through the story. He then promises to provide for them and their children.',
    reflection: 'Joseph does not call the harm harmless. His words hold wrongdoing and hope together. This is his response in a particular story, not a demand that you restore trust before it is safe or rush the work of healing. You can be truthful about what happened while asking what a wise, life-giving next step might be.',
    question: 'What truth about your experience needs to be acknowledged?', action: 'Name the harm without minimizing it. Consider talking with a trusted pastor, counselor, or supportive person about what healthy boundaries could look like.',
    prayer: 'God, help me tell the truth about pain. Give me wisdom for boundaries, support for healing, and hope for what can grow beyond this moment. Amen.',
    fact: 'Genesis 50:21 includes a practical promise: Joseph will provide for his brothers and their children.',
    quiz: { question: 'What practical care does Joseph promise?', options: ['A throne for every brother', 'A journey to the sea', 'Provision for his brothers and their children'], answer: 2, explanation: 'Joseph’s reassurance in Genesis 50:21 includes nourishment for the family.' },
  },
  {
    id: 'nehemiah', person: 'Nehemiah', need: 'calling', theme: 'Looking for direction', title: 'Look closely. Then build together.',
    description: 'A broken wall, a careful inspection, and a shared next step.', passage: 'Nehemiah 2:11-18', verse: 'Nehemiah 2:18', quote: 'Let us rise up and build.',
    story: 'After arriving in Jerusalem, Nehemiah goes out at night with a few companions to inspect its damaged walls and gates. He observes the problem before presenting the work to the people. He then describes their shared situation, tells them of God’s favor and the king’s support, and invites them to rebuild. They answer together.',
    reflection: 'A sense of purpose often begins with paying attention. What is actually broken? Who is affected? Who is already doing the work? Nehemiah’s inspection gives his concern a concrete shape. You do not have to carry an entire community’s needs alone. Listen, understand one part of the problem, and look for people to work alongside.',
    question: 'What nearby need can you understand more carefully before trying to fix it?', action: 'Ask someone affected by the problem what would help. Choose one practical contribution you can make with others.',
    prayer: 'God, teach me to notice, listen, and serve. Turn my concern into careful action and help us work together for what is good. Amen.',
    fact: 'Nehemiah first inspects the damaged walls at night before he presents the rebuilding work to the wider group.',
    quiz: { question: 'What does Nehemiah do before inviting the people to rebuild?', options: ['Inspects the walls', 'Declares the work finished', 'Leaves the city permanently'], answer: 0, explanation: 'Nehemiah 2:12-16 describes the inspection; verses 17-18 record the invitation to build together.' },
  },
];

export const SEVEN_DAY_PATH = ['hagar', 'elijah', 'hannah', 'job', 'peter', 'ruth', 'nehemiah'];
export const getMoment = (id?: string) => SCRIPTURE_MOMENTS.find(moment => moment.id === id);
export const passageUrl = (moment: ScriptureMoment) => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(moment.passage)}&version=KJV`;
export function dailyMoment(date = new Date()): ScriptureMoment {
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  return SCRIPTURE_MOMENTS[Number.isFinite(day) ? ((day % SCRIPTURE_MOMENTS.length) + SCRIPTURE_MOMENTS.length) % SCRIPTURE_MOMENTS.length : 0];
}
export function searchMoments(query: string, theme = 'All', saved?: string[]) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return SCRIPTURE_MOMENTS.filter(moment => (theme === 'All' || moment.theme === theme) && (!saved || saved.includes(moment.id)) && words.every(word => `${moment.person} ${moment.title} ${moment.theme} ${moment.description} ${moment.passage} ${moment.fact}`.toLowerCase().includes(word)));
}
export const LIBRARY_STORAGE_KEY = 'elroi.scripture-library.v1';
export type ReadingProgress = { version: 1; saved: string[]; completed: string[] };
export function parseProgress(raw: string | null): ReadingProgress {
  const blank: ReadingProgress = { version: 1, saved: [], completed: [] };
  try {
    const data = JSON.parse(raw || 'null');
    if (!data || data.version !== 1) return blank;
    const valid = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && !!getMoment(id)))] : [];
    return { version: 1, saved: valid(data.saved), completed: valid(data.completed) };
  } catch { return blank; }
}
export function updateProgress(progress: ReadingProgress, kind: 'saved' | 'completed', id: string): ReadingProgress {
  if (!getMoment(id)) return progress;
  return { ...progress, [kind]: progress[kind].includes(id) ? progress[kind].filter(value => value !== id) : [...progress[kind], id] };
}
export function nextPathMoment(completed: string[]): ScriptureMoment | undefined {
  return getMoment(SEVEN_DAY_PATH.find(id => !completed.includes(id)));
}
export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  for (const word of text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)) {
    const last = chunks.length - 1;
    if (last >= 0 && chunks[last].length + word.length + 1 < 180) chunks[last] += ` ${word}`;
    else chunks.push(word);
  }
  return chunks;
}
