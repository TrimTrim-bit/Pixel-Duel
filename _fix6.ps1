Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$raw = [System.IO.File]::ReadAllText("ai_universal.js")
$raw = $raw.Replace("}) ();", "})();")
[System.IO.File]::WriteAllText("ai_universal.js", $raw)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
