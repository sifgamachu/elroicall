import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cinematic = readFileSync(
  new URL("../src/components/CinematicFeed.tsx", import.meta.url),
  "utf8"
);
const walk = readFileSync(
  new URL("../src/components/WalkWithMe.tsx", import.meta.url),
  "utf8"
);
const begin = readFileSync(
  new URL("../src/pages/BeginWell.tsx", import.meta.url),
  "utf8"
);

test("cinematic Read Scripture opens the actual passage", () => {
  assert.match(cinematic, /biblegateway\.com\/passage/);
  assert.match(cinematic, /encodeURIComponent\(item\.passage\)/);
  assert.doesNotMatch(
    cinematic,
    /className="erc-feed-primary" to=\{studyHref\}/
  );
});

test("Walk With Me only offers reset actions that have real destinations", () => {
  assert.doesNotMatch(walk, /\["worship",\s*"Worship music"\]/);
  assert.match(walk, /to="\/begin\/\?need=prayer"/);
  assert.match(walk, /> Quiet prayer moment/);
  assert.match(walk, /to="\/begin\/"/);
});

test("quiet prayer opens a dedicated prayer entry prompt", () => {
  assert.match(begin, /prayer:\s*\{/);
  assert.match(begin, /what you want to bring into prayer/i);
  assert.match(begin, /I would like prayer for/);
});


test("cinematic Ask El Roi never silently truncates a conversation draft", () => {
  assert.match(cinematic, /next\.length > 2000/);
  assert.doesNotMatch(cinematic, /next\.slice\(0, 2000\)/);
  assert.match(cinematic, /none of your words are lost/i);
});

test("Walk With Me is represented by You in the mobile dock", () => {
  const dock = readFileSync(
    new URL("../src/components/AppDock.tsx", import.meta.url),
    "utf8"
  );
  assert.match(dock, /pathname\.startsWith\("\/app\/walk"\)/);
});


test("cinematic previews retry one expired signed URL without looping", () => {
  assert.match(cinematic, /videoRefreshes < 1/);
  assert.match(cinematic, /setVideoUrl\(""/);
  assert.match(cinematic, /setVideoRefreshes/);
});

test("Android accountability stops background work after permission removal", () => {
  const worker = readFileSync(
    new URL("../android/app/src/main/java/com/elroicall/app/AccountabilityWorker.java", import.meta.url),
    "utf8"
  );
  assert.match(worker, /!hasUsageAccess\(context\)[\s\S]*cancelUniqueWork\(WORK_NAME\)/);
});
