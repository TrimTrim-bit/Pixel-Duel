Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
# lines[251..254] (0-based) = the stray closers from the broken earlier edit; remove lines 252..255 (1-based)
$fixed = $lines[0..250] + $lines[255..($lines.Length-1)]
[System.IO.File]::WriteAllLines("ai_universal.js", $fixed)
Write-Output "removed 4 stray closer lines"
