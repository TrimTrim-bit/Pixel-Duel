Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$lines = [System.IO.File]::ReadAllLines("ai_universal.js")
# backtrack: strip the 3 closers we appended, keep original
$out = $lines[0..($lines.Length-4)]
[System.IO.File]::WriteAllLines("ai_universal.js", $out)
Write-Output "reverted"
