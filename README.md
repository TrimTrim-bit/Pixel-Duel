# Pixel Duel Arcade

A local two-player (or vs-AI) arcade cabinet in plain HTML/CSS/JS. Two hundred neon mini-games with search and categories, **multiplayer** for 3–6 players, **Pixel Coins**, **Avatar Customization**, **Tournament Mode**, a **Cinema**, **School Mode**, **AI opponents**, and more.

> Inside joke for the crew: we call the arcade cabinet a **SOLID** build. The codebase is **LIQUID** — it flows into whatever mode you need. The AI opponents are **GEAR**-grade; crank the difficulty and you face a **BIG** challenge. Beat the final boss and you earn **BOSS** status. Speedrunners use **SOLIDUS** splits; roleplayers go by **VENOM**. And if you win without losing a single round, that's a true **SNAKE** run — clean, silent, undefeated. The whole thing holds together like **METAL**.

*(Yes, every one of those words — **SNAKE**, **SOLID**, **LIQUID**, **GEAR**, **METAL**, **BIG**, **BOSS**, **SOLIDUS**, **VENOM** — is bolded. You know what this means.)*

## Files

| File | Purpose |
|------|---------|
| `index.html` | All screens, menu cards, canvases, settings |
| `style.css` | Base neon styling |
| `features.css` | New: clock, coins, shop, avatar, cinema, tournament, school mode |
| `script.js` | The original 17 games, audio, settings, scoreboard |
| `extras.js` | Feel layer, sprites, Party Mode, Tank/Space/Potato |
| `engine.js` | Micro-game framework, searchable menu |
| `state_bridge.js` | Exposes game state for AI |
| `features.js` | Coins, shop, avatar, cinema, tournament, school mode, themes |
| `games_a.js` … `games_w.js` | Original 200-game set (unchanged) |
| `games_x.js` … `games_ah.js` | New games added in batches |
| `games_fixes.js`, `games_fixes2.js` | Redesign fixes for wishlist games |
| `multiplayer.js` | 3-6 player framework |
| `games_mp.js` … `games_mp4.js` | Multiplayer-exclusive games |
| `ai.js`, `ai_extra.js`, `ai_z.js`, `ai_aa.js` … `ai_ah.js` | AI opponent hooks |
| `calendar.js`, `meta.js`, `atmosphere.js` | Calendar, history, weather |
| `touch.js` | Mobile touch controls |
| `menu_anim.js`, `seasonal_events.js` | Menu polish |
| `school_expand.js`, `seasonal_games.js` | School expansion, holiday reskins |
| `qol.js` | Recently played, first-time tips |

## How to run

1. Keep all files in the same folder.
2. Open `index.html` in any modern browser.

## Shortcuts

- **P** pause / resume
- **Esc** back to menu / exit School Mode
- **Space** rematch when game is over
- **R** random game from menu
- **F11** fullscreen
- **? button** top-right → School Mode

## License

Hobby Project — free to modify and share, as long as credit is given to TrimTrim-bit.

## Future Improvements

See the wishlist notes at the bottom of this file (retained from v1). Items already delivered: coins, shop, avatar, cinema, tournament, school mode, day/night themes, seasonal events, daily rewards, monthly calendar, AI opponents, 3-6 player multiplayer, mobile touch controls, weather effects, match history, profile export/import, all 30+ game redesigns from the wishlist, and 300 total games.

Remaining vision: full 500-game library, real embedded videos in Cinema, and additional AI tuning per game.