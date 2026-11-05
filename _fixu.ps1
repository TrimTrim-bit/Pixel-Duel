Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$raw = [System.IO.File]::ReadAllText("ai_universal.js")
$bad = "try { PD.micro.click(g, x, 430); y fallback 430; } catch (e) { }"
$good = "try { PD.micro.click(g, x, 430); } catch (e) { }"
if ($raw.Contains($bad)) {
  $raw = $raw.Replace($bad, $good)
  [System.IO.File]::WriteAllText("ai_universal.js", $raw)
  Write-Output "fixed"
} else {
  Write-Output "pattern not present (already fixed?)"
}
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
