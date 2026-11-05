/* _batch.mjs — run _bp.mjs in chunks over the frozen list, summarize real frozen games */
import { execFileSync } from "child_process";
import fs from "fs";
const ids = fs.readFileSync("_frozen_list.txt", "utf8").split(",").map(s => s.trim()).filter(Boolean);
const CHUNK = 6;
const verdicts = {};
for (let i = 0; i < ids.length; i += CHUNK) {
  const chunk = ids.slice(i, i + CHUNK);
  let out = "";
  try { out = execFileSync("node", ["_bp.mjs", chunk.join(",")], { encoding: "utf8", timeout: 120000 }); } catch (e) { out = String(e.stdout || "") + "\nERR:" + String(e.stderr || e.message).slice(0, 200); }
  for (const line of out.split("\n")) {
    const m = line.match(/^(\w[\w0-9]*):\s*open:([\w]+)\s*\|\s*uniq=(\d+)/);
    if (m) {
      verdicts[m[1]] = { screen: m[2], uniq: +m[3] };
      const keysM = line.match(/keys=([^|]*)/);
      if (keysM) verdicts[m[1]].keys = keysM[1].trim().slice(0, 90);
    }
  }
  console.log("chunk", i, "done");
}
for (const [id, v] of Object.entries(verdicts)) {
  const status = v.screen === "menu" ? "MENU-STUCK" : v.uniq === 0 ? "NOPUB" : v.uniq <= 1 ? "FROZEN" : "alive(" + v.uniq + ")";
  console.log(status.padEnd(12), id.padEnd(24), v.keys || "");
}
fs.writeFileSync("_batch_out.txt", JSON.stringify(verdicts, null, 1));
process.exit(0);
