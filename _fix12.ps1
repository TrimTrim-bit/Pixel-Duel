Set-Location "c:\Users\timot\Downloads\Pixel Duel MP"
$js = [System.IO.File]::ReadAllText("ai_universal.js")
# depth 3 = 3 unclosed opens before the single '})();'. Add two more closers: '} })();'
$js = $js.Replace("if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n})();",
                  "if (typeof requestAnimationFrame !== `"undefined`") requestAnimationFrame(loop);`n  }`n})();`n})();")
[System.IO.File]::WriteAllText("ai_universal.js", $js)
node --check ai_universal.js
Write-Output "syntax: $LASTEXITCODE"
