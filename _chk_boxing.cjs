const fs = require("fs");
const t = fs.readFileSync("games_c.js", "utf8");
const i = t.indexOf('id:"boxingGame"');
const j = t.indexOf('id:"copycatGame"');
console.log("boxing block chars:", j - i);
const blk = t.slice(i, j);
console.log("braces balance:", (blk.match(/{/g) || []).length - (blk.match(/}/g) || []).length);
console.log("parens balance:", (blk.match(/\(/g) || []).length - (blk.match(/\)/g) || []).length);
// check previous game block for premature close
const prevIds = [...t.matchAll(/id:"(\w+Game)"/g)].map(m => m[1]);
console.log("game order around boxing:", prevIds.slice(Math.max(0, prevIds.indexOf("boxingGame") - 2), prevIds.indexOf("boxingGame") + 3));
