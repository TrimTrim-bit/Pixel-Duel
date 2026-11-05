Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
# keep everything up to line 254 (index 253, header comment) + skip broken setup block (254..262, 0-based) keep second one from 263 (index 262)
$fixed = $lines[0..253] + $lines[262..($lines.Length-1)]
[System.IO.File]::WriteAllLines("ai_universal.js", $fixed)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
