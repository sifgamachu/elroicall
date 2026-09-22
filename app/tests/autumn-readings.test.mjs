import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUTUMN_READINGS, AUTUMN_WEEKS, readingForDay, parseAutumnProgress, readingCallUrl, readingPassageUrl } from '../src/lib/autumn-readings.ts';

test('the 84-day plan covers every chapter of the 66-book Bible once and in order', () => {
  const books = [['Genesis',50],['Exodus',40],['Leviticus',27],['Numbers',36],['Deuteronomy',34],['Joshua',24],['Judges',21],['Ruth',4],['1 Samuel',31],['2 Samuel',24],['1 Kings',22],['2 Kings',25],['1 Chronicles',29],['2 Chronicles',36],['Ezra',10],['Nehemiah',13],['Esther',10],['Job',42],['Psalms',150],['Proverbs',31],['Ecclesiastes',12],['Song of Solomon',8],['Isaiah',66],['Jeremiah',52],['Lamentations',5],['Ezekiel',48],['Daniel',12],['Hosea',14],['Joel',3],['Amos',9],['Obadiah',1],['Jonah',4],['Micah',7],['Nahum',3],['Habakkuk',3],['Zephaniah',3],['Haggai',2],['Zechariah',14],['Malachi',4],['Matthew',28],['Mark',16],['Luke',24],['John',21],['Acts',28],['Romans',16],['1 Corinthians',16],['2 Corinthians',13],['Galatians',6],['Ephesians',6],['Philippians',4],['Colossians',4],['1 Thessalonians',5],['2 Thessalonians',3],['1 Timothy',6],['2 Timothy',4],['Titus',3],['Philemon',1],['Hebrews',13],['James',5],['1 Peter',5],['2 Peter',3],['1 John',5],['2 John',1],['3 John',1],['Jude',1],['Revelation',22]];
  const expected=books.flatMap(([book,count])=>Array.from({length:count},(_,i)=>`${book} ${i+1}`));
  assert.equal(expected.length,1189);
  assert.equal(AUTUMN_READINGS.length,84);
  assert.equal(AUTUMN_WEEKS.length,12);
  const chapters=AUTUMN_READINGS.flatMap((reading,index)=>{
    assert.equal(reading.day,index+1);
    assert.ok(reading.question&&reading.notice&&reading.concept);
    return reading.passage.split('; ').flatMap(passage=>{
      const match=passage.match(/^(.+) (\d+)(?:-(\d+))?$/);
      assert.ok(match,passage);
      const [,book,start,end]=match;
      return Array.from({length:Number(end||start)-Number(start)+1},(_,i)=>`${book} ${Number(start)+i}`);
    });
  });
  assert.deepEqual(chapters,expected);
});
test('progress and routing reject corrupt or unsupported values',()=>{
  for(const raw of [null,'{','null','{}'])assert.deepEqual(parseAutumnProgress(raw),[]);
  assert.deepEqual(parseAutumnProgress('[84,1,1,0,-1,85,"2",2.5,null]'),[1,84]);
  for(const raw of [undefined,'0','85','-1','01','1x','1.5'])assert.equal(readingForDay(raw),undefined);
  assert.equal(readingForDay('84').passage,'Revelation 9-22');
});
test('reading and scheduling links retain the selected day and complete passage',()=>{
  for(const reading of AUTUMN_READINGS){
    const passage=new URL(readingPassageUrl(reading.passage));
    assert.equal(passage.origin,'https://www.biblegateway.com');
    assert.equal(passage.searchParams.get('search'),reading.passage);
    const call=new URL(readingCallUrl(reading),'https://elroicall.com');
    assert.equal(call.pathname,'/schedule/');
    assert.equal(call.searchParams.get('content'),'bible_study');
    assert.ok(call.searchParams.get('topic').includes(reading.passage));
    assert.ok(call.searchParams.get('topic').length<=160);
  }
});
