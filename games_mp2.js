/* =====================================================
   MULTIPLAYER PACK 2 — 8 one-key games (3-6P)
===================================================== */
(function(){
"use strict";
const W=900,H=500;
if(!window.multiplayer)return;
const GOLD="#ffe66d";

multiplayer({
  id:"mpRedLight",title:"Red Light Green Light",desc:"Press to advance. Stop when the light turns red.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS WHEN GREEN — DON'T MOVE ON RED",
  init(g){
    g.state="green";
    g.stateT=2+Math.random()*2;
    g.pl.forEach((p,i)=>{p.x=0;p.moved=false;});
  },
  update(g,dt){
    g.stateT-=dt;
    if(g.stateT<=0){
      if(g.state==="green"){g.state="yellow";g.stateT=.6;}
      else if(g.state==="yellow"){g.state="red";g.stateT=1.2+Math.random();}
      else{g.state="green";g.stateT=1.5+Math.random()*2;}
    }
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      if(g.inputs[i].a){
        if(g.state==="red"){
          p.x=Math.max(0,p.x-30);
          g.burst(80+p.x*3,300,p.color,8,200);
        }else{
          p.x+=55*dt;
        }
      }
      if(p.x>=100){g.end(i);return;}
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#2a5a2a";ctx.fillRect(0,400,W,100);
    for(let k=0;k<20;k++){
      ctx.fillStyle="rgba(255,255,255,.15)";
      ctx.fillRect(k*45,420,2,60);
    }
    ctx.fillStyle=GREEN;ctx.fillRect(W-60,80,6,320);
    for(let k=0;k<15;k++){ctx.fillStyle=k%2?"#111":"#fff";ctx.fillRect(W-60,80+k*21,6,21);}
    ctx.fillStyle="#222";ctx.fillRect(W/2-30,30,60,120);
    const colors={red:"#ff2244",yellow:"#ffd23a",green:"#2aff6a"};
    ["red","yellow","green"].forEach((c,i)=>{
      ctx.fillStyle=g.state===c?colors[c]:"#3a3a3a";
      ctx.beginPath();ctx.arc(W/2,55+i*35,14,0,Math.PI*2);ctx.fill();
    });
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=80+p.x*3;
      const y=400+(i-2)*20;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 10px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,y+4);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpMusical",title:"Musical Chairs",desc:"Press when the music stops to grab a chair.",
  min:3,max:6,keysPerPlayer:1,
  hint:"WHEN THE MUSIC STOPS, PRESS TO GRAB A CHAIR",
  init(g){
    g.musicPlaying=true;
    g.musicT=2+Math.random()*2;
    g.chairs=g.players.length-1;
    g.grabbed=[];
    g.eliminated=g.players.map(()=>false);
    g.alive=g.players.length;
  },
  update(g,dt){
    if(g.musicPlaying){
      g.musicT-=dt;
      if(g.musicT<=0){g.musicPlaying=false;g.grabbed=[];}
    }else{
      for(let i=0;i<g.players.length;i++){
        if(g.eliminated[i])continue;
        if(g.inputs[i].pa&&g.grabbed.length<g.chairs){
          g.grabbed.push(i);
        }
      }
      if(g.grabbed.length>=g.chairs){
        for(let i=0;i<g.players.length;i++){
          if(!g.eliminated[i]&&!g.grabbed.includes(i)){g.eliminated[i]=true;g.alive--;}
        }
        if(g.alive<=1){
          const winner=g.eliminated.findIndex(e=>!e);
          g.end(winner);return;
        }
        g.chairs=g.alive-1;
        g.musicPlaying=true;g.musicT=1.5+Math.random()*2;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#2a1a3a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=60)for(let y=0;y<H;y+=60){
      if(((x+y)/60)%2===0){ctx.fillStyle="#3a2a4a";ctx.fillRect(x,y,60,60);}
    }
    for(let i=0;i<g.chairs;i++){
      const x=100+i*(W-200)/Math.max(1,g.chairs-1)+100;
      const y=250;
      ctx.fillStyle="#8a5a2a";ctx.fillRect(x-25,y-8,50,16);
      ctx.fillStyle="#6a3a1a";ctx.fillRect(x-25,y-30,50,22);
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.strokeRect(x-25,y-30,50,38);
    }
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=80+i*(W-160)/Math.max(1,g.players.length-1);
      const y=380;
      if(g.eliminated[i]){
        ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;
        ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        continue;
      }
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,y+5);ctx.textAlign="left";
      if(g.grabbed.includes(i)){
        ctx.strokeStyle=GOLD;ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.stroke();
      }
    }
    g.text(g.musicPlaying?"🎵 MUSIC PLAYING":"MUSIC STOPPED — PRESS!",W/2,30,18,g.musicPlaying?GOLD:"#ff2244","center");
    g.text("CHAIRS: "+g.chairs,W/2,450,16,"#9fc0ff","center");
  }
});

multiplayer({
  id:"mpBalloon",title:"Balloon Pop Pro",desc:"Balloon inflates. Press right before it pops.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS WHEN YOUR BALLOON IS ABOUT TO POP",
  init(g){
    g.size=0.3;g.phase="inflate";g.inflateT=0;g.targetSize=0.9;
    g.players.forEach(p=>p.score=0);
  },
  update(g,dt){
    if(g.phase==="inflate"){
      g.size+=dt*.3;
      if(g.size>=1){g.phase="resolve";g.resolveT=1;g.banner="POPPED!";g.bannerT=1;}
    }else{
      g.resolveT-=dt;
      if(g.resolveT<=0){g.size=.3;g.phase="inflate";g.banner="";}
    }
    for(let i=0;i<g.players.length;i++){
      if(g.inputs[i].pa&&g.phase==="inflate"){
        const acc=Math.abs(g.size-g.targetSize);
        const pts=acc<.05?5:acc<.15?3:acc<.3?1:0;
        if(pts>0){
          g.players[i].score+=pts;
          g.banner=g.players[i].name+" +"+pts;
          g.bannerT=.8;
          g.burst(W/2,H/2,g.players[i].color,12,260);
          if(g.players[i].score>=15){g.end(i);return;}
        }else{
          g.banner=g.players[i].name+" TOO SOON";
          g.bannerT=.8;
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a3a";ctx.fillRect(0,0,W,H);
    const cx=W/2,cy=H/2;
    const r=100*g.size;
    ctx.fillStyle="#ff4a6a";
    ctx.beginPath();ctx.ellipse(cx,cy-r*.3,r,r*1.15,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.4)";
    ctx.beginPath();ctx.ellipse(cx-r*.4,cy-r*.7,r*.2,r*.3,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#666";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cx,cy-r*.3+r*1.15);ctx.lineTo(cx,cy-r*.3+r*1.15+30);ctx.stroke();
    ctx.strokeStyle=GOLD;ctx.lineWidth=3;ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.arc(cx,cy-r*.3,100*g.targetSize,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=W/(g.players.length+1)*(i+1);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,80,22,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,85);
      g.text((p.score||0)+"/15",x,120,16,p.color,"center");
      ctx.fillStyle="#9fc0ff";ctx.font="10px Courier New";
      const keyLabel=p.keys.a===" "?"SPACE":p.keys.a.toUpperCase();
      ctx.fillText(keyLabel,x,140);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpRace100",title:"Race to 100",desc:"Mash to fill your meter first.",
  min:3,max:6,keysPerPlayer:1,
  hint:"MASH YOUR KEY TO FILL THE METER FIRST",
  init(g){
    g.values=new Array(g.players.length).fill(0);
    g.flash=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    for(let i=0;i<g.players.length;i++){
      g.flash[i]=Math.max(0,g.flash[i]-dt);
      if(g.inputs[i].pa){
        g.values[i]+=1;
        g.flash[i]=.1;
        if(g.values[i]>=100){g.end(i);return;}
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const n=g.players.length;
    const barW=W/(n+1);
    for(let i=0;i<n;i++){
      const p=g.players[i];
      const x=barW*(i+1);
      ctx.fillStyle=g.flash[i]>0?p.color:"#2a2f63";
      ctx.fillRect(x-barW*.4,150,barW*.8,H-250);
      ctx.fillStyle=p.color;
      ctx.fillRect(x-barW*.4,150+(H-250)*(1-g.values[i]/100),barW*.8,(H-250)*g.values[i]/100);
      ctx.strokeStyle=p.color;ctx.lineWidth=3;
      ctx.strokeRect(x-barW*.4,150,barW*.8,H-250);
      g.text(p.name,x,80,22,p.color,"center");
      g.text(g.values[i]+"/100",x,120,14,"#fff","center");
      ctx.font="10px Courier New";ctx.fillStyle="#9fc0ff";ctx.textAlign="center";
      const keyLabel=p.keys.a===" "?"SPACE":p.keys.a.toUpperCase();
      ctx.fillText(keyLabel,x,H-60);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpJumpRope",title:"Jump Rope Multi",desc:"Press to jump when the rope comes. Trip = out.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO JUMP OVER THE ROPE",
  init(g){
    g.rope={phase:0,speed:1.4};
    g.eliminated=g.players.map(()=>false);
    g.alive=g.players.length;
    g.jumpTimer=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.rope.phase+=g.rope.speed*dt;
    g.rope.speed=Math.min(2.5,1.4+g.t*.02);
    const swung=Math.floor(g.rope.phase)!==Math.floor(g.rope.phase-dt*g.rope.speed);
    for(let i=0;i<g.players.length;i++){
      if(g.eliminated[i])continue;
      g.jumpTimer[i]=Math.max(0,g.jumpTimer[i]-dt);
      if(g.inputs[i].pa)g.jumpTimer[i]=.35;
      if(swung&&g.jumpTimer[i]<=0){
        g.eliminated[i]=true;
        g.alive--;
        const x=W/(g.players.length+1)*(i+1);
        g.burst(x,420,g.players[i].color,20,400);
        if(g.alive<=1){
          const winner=g.eliminated.findIndex(e=>!e);
          g.end(winner);return;
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a3a";ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#2a5a3a";ctx.fillRect(0,440,W,60);
    const cx=W/2,r=200;
    const ang=g.rope.phase*Math.PI;
    ctx.strokeStyle=GOLD;ctx.lineWidth=4;
    ctx.beginPath();
    for(let a=-Math.PI/2;a<=Math.PI*1.5;a+=0.1){
      const x=cx+Math.cos(ang+a)*r;
      const y=440-Math.abs(Math.sin(ang+a))*100;
      if(a===-Math.PI/2)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=W/(g.players.length+1)*(i+1);
      if(g.eliminated[i]){
        ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;
        ctx.beginPath();ctx.arc(x,420,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        continue;
      }
      const jumpH=g.jumpTimer[i]>0?Math.sin((1-g.jumpTimer[i]/.35)*Math.PI)*50:0;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,420-jumpH,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,420-jumpH+5);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpSniper",title:"Sniper",desc:"Crosshair sweeps. Press when it's on your target.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS WHEN CROSSHAIR CROSSES YOUR TARGET",
  init(g){
    g.crossT=0;g.crossX=0;g.crossY=0;
    g.targets=g.players.map((_,i)=>{
      const x=W/(g.players.length+1)*(i+1);
      return {x,y:220,r:25};
    });
    g.aimT=1.2;g.fired=false;
    g.roundScores=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.crossT+=dt;
    g.crossX=W/2+Math.sin(g.crossT*1.5)*350;
    g.crossY=250+Math.cos(g.crossT*1.1)*120;
    if(g.fired){
      g.aimT-=dt;
      if(g.aimT<=0){g.fired=false;g.aimT=1.2;}
      return;
    }
    for(let i=0;i<g.players.length;i++){
      if(g.inputs[i].pa){
        const t=g.targets[i];
        const dist=Math.hypot(g.crossX-t.x,g.crossY-t.y);
        if(dist<t.r){
          g.roundScores[i]++;
          g.burst(t.x,t.y,g.players[i].color,20,400);
          g.banner=g.players[i].name+" HIT!";
          g.bannerT=1;
          if(g.roundScores[i]>=3){g.end(i);return;}
          g.fired=true;
          break;
        }else{
          g.roundScores[i]=Math.max(0,g.roundScores[i]-1);
          g.banner=g.players[i].name+" MISS";
          g.bannerT=.5;
          g.fired=true;
          break;
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a2a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){
      if(((x+y)/50)%2===0){ctx.fillStyle="#142440";ctx.fillRect(x,y,50,50);}
    }
    for(let i=0;i<g.players.length;i++){
      const t=g.targets[i];
      const p=g.players[i];
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(t.x,t.y,t.r*.6,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(t.x,t.y,t.r*.3,0,Math.PI*2);ctx.stroke();
      g.text(p.name,t.x,t.y-t.r-10,14,p.color,"center");
      g.text(g.roundScores[i]+"/3",t.x,t.y+t.r+20,12,"#fff","center");
    }
    ctx.strokeStyle="#ffe66d";ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(g.crossX,g.crossY,18,0,Math.PI*2);
    ctx.moveTo(g.crossX-24,g.crossY);ctx.lineTo(g.crossX+24,g.crossY);
    ctx.moveTo(g.crossX,g.crossY-24);ctx.lineTo(g.crossX,g.crossY+24);
    ctx.stroke();
  }
});

multiplayer({
  id:"mpPressure",title:"Pressure Plate",desc:"Press when YOUR plate lights up. Wrong press = penalty.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS ONLY WHEN YOUR PLATE IS LIT",
  init(g){
    g.active=ri(0,g.players.length-1);
    g.activeT=1.5;
    g.scores=new Array(g.players.length).fill(0);
    g.lock=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.activeT-=dt;
    if(g.activeT<=0){
      g.active=ri(0,g.players.length-1);
      g.activeT=Math.max(.6,1.5-Math.max(...g.scores)*.05);
    }
    for(let i=0;i<g.players.length;i++){
      g.lock[i]=Math.max(0,g.lock[i]-dt);
      if(g.lock[i]>0)continue;
      if(g.inputs[i].pa){
        if(i===g.active){
          g.scores[i]++;
          g.burst(W/(g.players.length+1)*(i+1),300,g.players[i].color,15,300);
          if(g.scores[i]>=5){g.end(i);return;}
          g.active=-1;g.activeT=.5;
        }else{
          g.scores[i]=Math.max(0,g.scores[i]-1);
          g.lock[i]=1;
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a20";ctx.fillRect(0,0,W,H);
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=W/(g.players.length+1)*(i+1);
      const y=300;
      const isActive=i===g.active;
      ctx.fillStyle=isActive?p.color:"#2a2f63";
      ctx.beginPath();ctx.arc(x,y,60,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=isActive?"#fff":"#4a4f8a";ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x,y,60,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=isActive?"#080b18":"#9fc0ff";
      ctx.font="bold 20px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,y+7);ctx.textAlign="left";
      g.text(g.scores[i]+"/5",x,80,18,p.color,"center");
      ctx.fillStyle="#9fc0ff";ctx.font="11px Courier New";ctx.textAlign="center";
      const keyLabel=p.keys.a===" "?"SPACE":p.keys.a.toUpperCase();
      ctx.fillText(keyLabel,x,y+80);ctx.textAlign="left";
    }
    if(g.active>=0&&g.active<g.players.length){
      g.text("PRESS "+g.players[g.active].name+"'S KEY!",W/2,30,20,g.players[g.active].color,"center");
    }else{
      g.text("WAIT...",W/2,30,20,"#9fc0ff","center");
    }
  }
});

multiplayer({
  id:"mpQuickDraw",title:"Quick Draw",desc:"Signal fires — last to press is out.",
  min:3,max:6,keysPerPlayer:1,
  hint:"WHEN THE SIGNAL FIRES, PRESS FAST",
  init(g){
    g.phase="wait";
    g.waitT=2+Math.random()*3;
    g.eliminated=g.players.map(()=>false);
    g.alive=g.players.length;
    g.goT=0;g.pressed=[];
  },
  update(g,dt){
    if(g.phase==="wait"){
      g.waitT-=dt;
      if(g.waitT<=0){g.phase="go";g.goT=0;g.pressed=[];}
    }else if(g.phase==="go"){
      g.goT+=dt;
      for(let i=0;i<g.players.length;i++){
        if(g.eliminated[i])continue;
        if(g.inputs[i].pa&&!g.pressed.includes(i))g.pressed.push(i);
      }
      if(g.goT>1.5||g.pressed.length>=g.alive-1){
        for(let i=0;i<g.players.length;i++){
          if(g.eliminated[i])continue;
          if(!g.pressed.includes(i)){
            g.eliminated[i]=true;g.alive--;
            g.burst(W/(g.players.length+1)*(i+1),300,g.players[i].color,20,400);
            if(g.alive<=1){
              const winner=g.eliminated.findIndex(e=>!e);
              g.end(winner);return;
            }
            break;
          }
        }
        g.phase="wait";g.waitT=1.5+Math.random()*2;
      }
    }
  },
  draw(g,ctx){
    if(g.phase==="wait"){
      ctx.fillStyle="#0a0a20";ctx.fillRect(0,0,W,H);
      g.text("WAIT...",W/2,H/2,80,"#9fc0ff","center");
    }else{
      ctx.fillStyle="#ffe66d";ctx.fillRect(0,0,W,H);
      g.text("GO!",W/2,H/2,120,"#111","center");
    }
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=W/(g.players.length+1)*(i+1);
      if(g.eliminated[i]){
        ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;
        ctx.beginPath();ctx.arc(x,80,22,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      }else{
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(x,80,22,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      }
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,85);ctx.textAlign="left";
    }
  }
});

})();