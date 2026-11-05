Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
# keyAI's closing brace is missing its IIFE-level indentation but the file lost the
# '}' that closes keyAI's own function? line 250 '}' closes keyAI? No—line 250 closes
# the for-loop 'for (...)' at 246, and 252 '}' closes keyAI. Then 262 closes setup's try?...
# Depth=3 says: 3 opens never closed. Candidates: IIFE { at 17, and '}' at 253 area.
# Just append the missing closers: '}' x2 + '})();'
$last = $lines.Length
$out = $lines[0..($last-2)]  # drop final '})();'
$out += "}"
$out += "}"
$out += "})();"
[System.IO.File]::WriteAllLines("ai_universal.js", $out)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
