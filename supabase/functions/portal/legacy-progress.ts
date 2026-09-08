const CANON: [string, number][] = [["Genesis",50],["Exodus",40],["Leviticus",27],["Numbers",36],["Deuteronomy",34],["Joshua",24],["Judges",21],["Ruth",4],["First Samuel",31],["Second Samuel",24],["First Kings",22],["Second Kings",25],["First Chronicles",29],["Second Chronicles",36],["Ezra",10],["Nehemiah",13],["Esther",10],["Job",42],["Psalms",150],["Proverbs",31],["Ecclesiastes",12],["Song of Songs",8],["Isaiah",66],["Jeremiah",52],["Lamentations",5],["Ezekiel",48],["Daniel",12],["Hosea",14],["Joel",3],["Amos",9],["Obadiah",1],["Jonah",4],["Micah",7],["Nahum",3],["Habakkuk",3],["Zephaniah",3],["Haggai",2],["Zechariah",14],["Malachi",4],["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],["First Corinthians",16],["Second Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],["Colossians",4],["First Thessalonians",5],["Second Thessalonians",3],["First Timothy",6],["Second Timothy",4],["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["First Peter",5],["Second Peter",3],["First John",5],["Second John",1],["Third John",1],["Jude",1],["Revelation",22]];
const TOTAL = CANON.reduce((n, [, c]) => n + c, 0);
function chapterAt(idx: number) {
  let i = ((idx % TOTAL) + TOTAL) % TOTAL;
  for (const [book, count] of CANON) { if (i < count) return { book, chapter: i + 1 }; i -= count; }
  return { book: "Revelation", chapter: 22 };
}
export function progressFor(mode: string, day: number) {
  if (mode === "journey") {
    const dayIn = ((Math.max(1, day) - 1) % 365) + 1;
    const a = chapterAt(Math.floor(((dayIn - 1) * TOTAL) / 365));
    const b = chapterAt(Math.floor((dayIn * TOTAL) / 365) - 1);
    const range = a.book === b.book ? `${a.book} ${a.chapter}–${b.chapter}` : `${a.book} ${a.chapter} → ${b.book} ${b.chapter}`;
    return { label: `Day ${dayIn} of 365`, next: range, pct: Math.round(((dayIn - 1) / 365) * 100), chapters_done: Math.floor(((dayIn - 1) * TOTAL) / 365) };
  }
  if (mode === "sermon") {
    const walkDay = ((Math.max(1, day) - 1) % TOTAL) + 1;
    const c = chapterAt(walkDay - 1);
    return { label: `Chapter ${walkDay} of ${TOTAL}`, next: `${c.book} ${c.chapter}`, pct: Math.round(((walkDay - 1) / TOTAL) * 100), chapters_done: walkDay - 1 };
  }
  return null;
}
