Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
# remove the duplicated 'function setup(gameId) {' at line 254 (0-based 253)
$fixed = $lines[0..252] + $lines[254..($lines.Length-1)]
[System.IO.File]::WriteAllLines("ai_universal.js", $fixed)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
