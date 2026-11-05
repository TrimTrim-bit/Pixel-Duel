@echo off
:: Pixel Duel - verify all required files are present
cd /d "%~dp0"
echo Checking Pixel Duel files...
echo.
set OK=1

echo === Core ===
if exist index.html       (echo [OK] index.html)       else (echo [MISSING] index.html       & set OK=0)
if exist style.css        (echo [OK] style.css)        else (echo [MISSING] style.css        & set OK=0)
if exist features.css     (echo [OK] features.css)     else (echo [MISSING] features.css     & set OK=0)
if exist script.js        (echo [OK] script.js)        else (echo [MISSING] script.js        & set OK=0)
if exist extras.js        (echo [OK] extras.js)        else (echo [MISSING] extras.js        & set OK=0)
if exist engine.js        (echo [OK] engine.js)        else (echo [MISSING] engine.js        & set OK=0)
if exist state_bridge.js  (echo [OK] state_bridge.js)  else (echo [MISSING] state_bridge.js  & set OK=0)
if exist features.js      (echo [OK] features.js)      else (echo [MISSING] features.js      & set OK=0)

echo.
echo === Original game packs ===
if exist games_a.js (echo [OK] games_a.js) else (echo [MISSING] games_a.js & set OK=0)
if exist games_b.js (echo [OK] games_b.js) else (echo [MISSING] games_b.js & set OK=0)
if exist games_c.js (echo [OK] games_c.js) else (echo [MISSING] games_c.js & set OK=0)
if exist games_d.js (echo [OK] games_d.js) else (echo [MISSING] games_d.js & set OK=0)
if exist games_e.js (echo [OK] games_e.js) else (echo [MISSING] games_e.js & set OK=0)
if exist games_f.js (echo [OK] games_f.js) else (echo [MISSING] games_f.js & set OK=0)
if exist games_g.js (echo [OK] games_g.js) else (echo [MISSING] games_g.js & set OK=0)
if exist games_h.js (echo [OK] games_h.js) else (echo [MISSING] games_h.js & set OK=0)
if exist games_k.js (echo [OK] games_k.js) else (echo [MISSING] games_k.js & set OK=0)
if exist games_m.js (echo [OK] games_m.js) else (echo [MISSING] games_m.js & set OK=0)
if exist games_n.js (echo [OK] games_n.js) else (echo [MISSING] games_n.js & set OK=0)
if exist games_o.js (echo [OK] games_o.js) else (echo [MISSING] games_o.js & set OK=0)
if exist games_p.js (echo [OK] games_p.js) else (echo [MISSING] games_p.js & set OK=0)
if exist games_q.js (echo [OK] games_q.js) else (echo [MISSING] games_q.js & set OK=0)
if exist games_r.js (echo [OK] games_r.js) else (echo [MISSING] games_r.js & set OK=0)
if exist games_s.js (echo [OK] games_s.js) else (echo [MISSING] games_s.js & set OK=0)
if exist games_t.js (echo [OK] games_t.js) else (echo [MISSING] games_t.js & set OK=0)
if exist games_u.js (echo [OK] games_u.js) else (echo [MISSING] games_u.js & set OK=0)
if exist games_v.js (echo [OK] games_v.js) else (echo [MISSING] games_v.js & set OK=0)
if exist games_w.js (echo [OK] games_w.js) else (echo [MISSING] games_w.js & set OK=0)

echo.
echo === New game packs ===
if exist games_x.js  (echo [OK] games_x.js)  else (echo [MISSING] games_x.js  & set OK=0)
if exist games_y.js  (echo [OK] games_y.js)  else (echo [MISSING] games_y.js  & set OK=0)
if exist games_z.js  (echo [OK] games_z.js)  else (echo [MISSING] games_z.js  & set OK=0)
if exist games_aa.js (echo [OK] games_aa.js) else (echo [MISSING] games_aa.js & set OK=0)
if exist games_ab.js (echo [OK] games_ab.js) else (echo [MISSING] games_ab.js & set OK=0)
if exist games_ac.js (echo [OK] games_ac.js) else (echo [MISSING] games_ac.js & set OK=0)
if exist games_ad.js (echo [OK] games_ad.js) else (echo [MISSING] games_ad.js & set OK=0)
if exist games_ae.js (echo [OK] games_ae.js) else (echo [MISSING] games_ae.js & set OK=0)
if exist games_af.js (echo [OK] games_af.js) else (echo [MISSING] games_af.js & set OK=0)
if exist games_ag.js (echo [OK] games_ag.js) else (echo [MISSING] games_ag.js & set OK=0)
if exist games_ah.js (echo [OK] games_ah.js) else (echo [MISSING] games_ah.js & set OK=0)

echo.
echo === Fix packs ===
if exist games_fixes.js  (echo [OK] games_fixes.js)  else (echo [MISSING] games_fixes.js  & set OK=0)
if exist games_fixes2.js (echo [OK] games_fixes2.js) else (echo [MISSING] games_fixes2.js & set OK=0)

echo.
echo === Multiplayer ===
if exist multiplayer.js (echo [OK] multiplayer.js) else (echo [MISSING] multiplayer.js & set OK=0)
if exist games_mp.js    (echo [OK] games_mp.js)    else (echo [MISSING] games_mp.js    & set OK=0)
if exist games_mp2.js   (echo [OK] games_mp2.js)   else (echo [MISSING] games_mp2.js   & set OK=0)
if exist games_mp3.js   (echo [OK] games_mp3.js)   else (echo [MISSING] games_mp3.js   & set OK=0)
if exist games_mp4.js   (echo [OK] games_mp4.js)   else (echo [MISSING] games_mp4.js   & set OK=0)

echo.
echo === AI ===
if exist ai.js       (echo [OK] ai.js)       else (echo [MISSING] ai.js       & set OK=0)
if exist ai_extra.js (echo [OK] ai_extra.js) else (echo [MISSING] ai_extra.js & set OK=0)
if exist ai_z.js     (echo [OK] ai_z.js)     else (echo [MISSING] ai_z.js     & set OK=0)
if exist ai_aa.js    (echo [OK] ai_aa.js)    else (echo [MISSING] ai_aa.js    & set OK=0)
if exist ai_ab.js    (echo [OK] ai_ab.js)    else (echo [MISSING] ai_ab.js    & set OK=0)
if exist ai_ac.js    (echo [OK] ai_ac.js)    else (echo [MISSING] ai_ac.js    & set OK=0)
if exist ai_ad.js    (echo [OK] ai_ad.js)    else (echo [MISSING] ai_ad.js    & set OK=0)
if exist ai_ae.js    (echo [OK] ai_ae.js)    else (echo [MISSING] ai_ae.js    & set OK=0)
if exist ai_af.js    (echo [OK] ai_af.js)    else (echo [MISSING] ai_af.js    & set OK=0)
if exist ai_ag.js    (echo [OK] ai_ag.js)    else (echo [MISSING] ai_ag.js    & set OK=0)
if exist ai_ah.js    (echo [OK] ai_ah.js)    else (echo [MISSING] ai_ah.js    & set OK=0)

echo.
echo === Utilities ===
if exist calendar.js        (echo [OK] calendar.js)        else (echo [MISSING] calendar.js        & set OK=0)
if exist meta.js            (echo [OK] meta.js)            else (echo [MISSING] meta.js            & set OK=0)
if exist atmosphere.js      (echo [OK] atmosphere.js)      else (echo [MISSING] atmosphere.js      & set OK=0)
if exist touch.js           (echo [OK] touch.js)           else (echo [MISSING] touch.js           & set OK=0)
if exist menu_anim.js       (echo [OK] menu_anim.js)       else (echo [MISSING] menu_anim.js       & set OK=0)
if exist seasonal_events.js (echo [OK] seasonal_events.js) else (echo [MISSING] seasonal_events.js & set OK=0)
if exist school_expand.js   (echo [OK] school_expand.js)   else (echo [MISSING] school_expand.js   & set OK=0)
if exist seasonal_games.js  (echo [OK] seasonal_games.js)  else (echo [MISSING] seasonal_games.js  & set OK=0)
if exist qol.js             (echo [OK] qol.js)             else (echo [MISSING] qol.js             & set OK=0)

echo.
echo ==============================
if %OK%==1 (
    echo All 66 required files present. Run start.bat to play.
) else (
    echo SOME FILES ARE MISSING — see [MISSING] entries above.
)
echo ==============================
pause