Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$js = [System.IO.File]::ReadAllText("ai_universal.js")
# revert that brace add (remove the lone '}' I added)
$js = $js.Replace("if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n  }`n})();",
                  "if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n})();")
# depth=2 means TWO unclosed braces. Check where: find 'function loop() {' — is it INSIDE the IIFE
# or top-level? If depth ends 2 with IIFE open(+1) and... let's just check line 17 '(' + '{' = 2 open.
# So depth 2 = the IIFE's '(' and '{' never closed → final closer must be '  })();' preceded by '}'
# meaning: one '}' to close the (function(){ ...  then ')' to close ( ... then '();'.
# Actually '})();' IS that. depth 2 => we're missing closers INSIDE. Loop function never closed?
$idx = $js.IndexOf("function loop() {")
$setupIdx = $js.IndexOf("function setup(gameId) {")
$funcIdx = $js.IndexOf("(function () {")
Write-Output "IIFE at $funcIdx, setup at $setupIdx, loop at $idx"
# count braces between setup start and loop start — if setup's closing '}' missing, add it
$seg = $js.Substring($setupIdx, $idx - $setupIdx)
$d = 0
foreach ($ch in $seg.ToCharArray()) { if ($ch -eq '{') { $d++ } elseif ($ch -eq '}') { $d-- } }
Write-Output "setup segment depth delta: $d"
