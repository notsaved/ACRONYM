const fs = require('fs');
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const start = html.indexOf("function makeVerseEngine");
const endMarker = html.indexOf("/* ---------- loader ---------- */");
const src = html.slice(start, endMarker);
const pick = (r, a) => a[Math.floor(r() * a.length)];
eval(src);

// mock acronyms with varied endings
const A = [];
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (let i = 0; i < 400; i++) {
  let s = "";
  const len = 3 + Math.floor(Math.random() * 6);
  for (let j = 0; j < len; j++) s += letters[Math.floor(Math.random() * 26)];
  A.push(s);
}
A.push("AB", "Z"); // short ones
const stanza = makeVerseEngine(A);

// 1) line-length distribution over many stanzas
const counts = {1:0,2:0,3:0,4:0,5:0,6:0};
let total = 0, bad = 0;
for (let s = 0; s < 4000; s++) {
  for (const st of stanza()) {
    for (const line of st.split("\n")) {
      const n = line.split(" ").length;
      if (n >= 1 && n <= 6) { counts[n]++; total++; } else { bad++; console.log("BAD LINE LEN", n, JSON.stringify(line)); }
    }
  }
}
console.log("bad lines:", bad);
console.log("length distribution:", Object.fromEntries(Object.entries(counts).map(([k,v]) => [k, (100*v/total).toFixed(1)+"%"])));

// 2) sonnet GG final couplet: last-3 letters should match only when rhyme k>=3
let gg3 = 0, ggTot = 0, ggAny = 0;
for (let s = 0; s < 30000; s++) {
  const st = stanza();
  if (st.length === 4 && st[3].split("\n").length === 2 && st[0].split("\n").length === 4 && st[1].split("\n").length === 4) {
    const last = st[3].split("\n");
    const e0 = last[0].split(" ").pop(), e1 = last[1].split(" ").pop();
    ggTot++;
    if (e0.slice(-3) === e1.slice(-3)) gg3++;
    if (e0.slice(-1) === e1.slice(-1)) ggAny++;
  }
}
console.log("sonnets:", ggTot, "| GG share last letter:", (100*ggAny/ggTot).toFixed(1)+"%", "| share last-3:", (100*gg3/ggTot).toFixed(1)+"%");

// 3) no acrostic: none of the old acrostic words forced at line starts beyond chance
let acrosticHits = 0;
const words = ["EUROPA","HORIZON","BRUSSELS","FRAMEWORK","GRANT","RESEARCH","DELFT","OSLO","INNOVATE","CORDIS","MISTRAL"];
for (let s = 0; s < 5000; s++) {
  for (const st of stanza()) for (const line of st.split("\n")) {
    if (words.includes(line.split(" ")[0])) acrosticHits++;
  }
}
console.log("acrostic-word line starts (chance-level only):", acrosticHits);

// 4) distinct stanza shapes
const seen = {};
for (let s = 0; s < 20000; s++) {
  const st = stanza();
  const sig = st.map(x => x.split("\n").length).join(",");
  seen[sig] = (seen[sig]||0)+1;
}
console.log("distinct stanza shapes seen:", Object.keys(seen).length);
console.log("\nsample stanza:\n" + stanza().join("\n---\n"));
