/* =====================================================
   MULTIPLAYER PACK 4 — 5 more one-key games (3-6P)
===================================================== */
(function(){
"use strict";
const W=900,H=500;
if(!window.multiplayer)return;
const GOLD="#ffe66d";

multiplayer({
  id:"mpTowerStack",title:"Tower Stack (MP)",desc:"Drop blocks. Miss and you're out.",
  min:4,max:6,keysPerPlayer:1,
  hint:"PRESS TO DROP — OVERLAP PREVIOUS BLOCK",
  init(g){
    const n=g.players.length;
    const colW=W/n;
    for(let i=0;i<n;i++){
      const p=g.players[i];
      p.colX=i*colW+colW/2;
      p.stack=[{x:-70,w:140}];
      p.cur={x:-140,w:140,dir:1};
      p.speed=140;
      p.eliminated=false;
    }
  },
  update(g,dt){
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      if(p.eliminated)continue;
      const c=p.cur;
      c.x+=c.dir*p.speed*dt;
      if(c.x>200-c.w*.2){c.dir=-1;}
      if(c.x<-200-c.w*.8){c.dir=1;}
      if(g.inputs[i].pa){
        const top=p.stack[p.stack.length-1];
        const l=Math.max(c.x,top.x),r=Math.min(c.x+c.w,top.x+top.w);
        const w=r-l;
        if(w<=2){
          p.eliminated=true;
          g.finished[i]=true;
          g.burst(p.colX,150,p.color,25,400);
          g.done();
          if(g.mode!=="play")return;
        }else{
          const perfect=Math.abs(c.x-top.x)<5;
          p.stack.push({x:perfect?top.x:l,w:perfect?top.w:w});
          p.cur={x:-220,w:perfect?top.w:w,dir:1};
          p.speed=Math.min(340,140+p.stack.length*8);
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#12183a";ctx.fillRect(0,0,W,H);
    const n=g.players.length;
    const colW=W/n;
    for(let i=0;i<n;i++){
      const p=g.players[i];
      if(i>0){ctx.fillStyle="rgba(255,255,255,.1)";ctx.fillRect(i*colW-1,60,2,H-80);}
      ctx.fillStyle="rgba(255,255,255,.05)";
      ctx.fillRect(i*colW+10,H-40,colW-20,20);
      if(p.eliminated){
        g.text("OUT",p.colX,H-60,20,"#6a72a8","center");
        continue;
      }
      p.stack.forEach((b,k)=>{
        const y=H-60-k*20;
        if(y<80)return;
        ctx.fillStyle=`hsl(${(k*28+i*80)%360},70%,${k===0?35:58}%)`;
        ctx.fillRect(p.colX+b.x,y,b.w,18);
        ctx.fillStyle="rgba(255,255,255,.3)";ctx.fillRect(p.colX+b.x,y,b.w,3);
        ctx.strokeStyle="#080b18";ctx.lineWidth=1;ctx.strokeRect(p.colX+b.x,y,b.w,18);
      });
      const c=p.cur;
      const y=H-60-p.stack.length*20;
      ctx.fillStyle=p.color;
      ctx.fillRect(p.colX+c.x,y,c.w,18);
      ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(p.colX+c.x,y,c.w,18);
      g.text(p.name,p.colX,40,20,p.color,"center");
      const keyLabel=p.keys.a===" "?"SPACE":p.keys.a.toUpperCase();
      g.text(keyLabel,p.colX,64,12,"#9fc0ff","center");
      g.text("H: "+p.stack.length,p.colX,H-16,12,p.color,"center");
    }
  }
});

multiplayer({
  id:"mpReaction",title:"Reaction Buzz",desc:"Signal appears — first to press wins the round.",
  min:3,max:6,keysPerPlayer:1,
  hint:"BE THE FIRST TO PRESS",
  init(g){
    g.roundScores=new Array(g.players.length).fill(0);
    g.roundsToWin=3;
    g.phase="wait";
    g.delay=1.5+Math.random()*2;
    g.goStart=0;
  },
  update(g,dt){
    if(g.phase==="wait"){
      g.delay-=dt;
      if(g.delay<=0){g.phase="go";g.goStart=0;}
    }else{
      g.goStart+=dt;
      for(let i=0;i<g.players.length;i++){
        if(g.inputs[i].pa){
          g.roundScores[i]++;
          if(g.roundScores[i]>=g.roundsToWin){g.end(i);return;}
          g.phase="wait";g.delay=1.2+Math.random()*2;
          break;
        }
      }
      if(g.phase==="go"&&g.goStart>3){g.phase="wait";g.delay=1;}
    }
  },
  draw(g,ctx){
    if(g.phase==="wait"){ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);g.text("WAIT...",W/2,H/2,70,"#9fc0ff","center");}
    else{ctx.fillStyle="#ffe66d";ctx.fillRect(0,0,W,H);g.text("GO!",W/2,H/2,110,"#111","center");}
    const n=g.players.length;
    for(let i=0;i<n;i++){
      const p=g.players[i];
      const x=W/(n+1)*(i+1);
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,80,24,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 13px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,86);
      g.text(g.roundScores[i]+"/3",x,120,14,p.color,"center");
      ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpSweeper",title:"Sweeper Dodge",desc:"Jump the rotating sweeper. Get hit and you're out.",
  min:4,max:6,keysPerPlayer:1,
  hint:"PRESS TO JUMP — DON'T GET SWEPT",
  init(g){
    g.ring={x:W/2,y:H/2+20,r:170};
    g.sweeper={ang:0,speed:1.4,len:g.ring.r-20};
    g.eliminated=g.players.map(()=>false);
    g.alive=g.players.length;
    g.jumpTimer=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.sweeper.ang+=g.sweeper.speed*dt;
    g.sweeper.speed=Math.min(3.5,1.4+g.t*.03);
    const n=g.players.length;
    for(let i=0;i<n;i++){
      if(g.eliminated[i])continue;
      const p=g.players[i];
      p.ang=i/n*Math.PI*2;
      g.jumpTimer[i]=Math.max(0,g.jumpTimer[i]-dt);
      if(g.inputs[i].pa)g.jumpTimer[i]=.4;
      const sa=((g.sweeper.ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
      const pa=((p.ang%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
      const diff=Math.abs(Math.atan2(Math.sin(sa-pa),Math.cos(sa-pa)));
      if(diff<0.12&&g.jumpTimer[i]<=0){
        g.eliminated[i]=true;
        g.finished[i]=true;
        g.alive--;
        const px=g.ring.x+Math.cos(p.ang)*g.ring.r;
        const py=g.ring.y+Math.sin(p.ang)*g.ring.r;
        g.burst(px,py,p.color,25,400);
        if(g.alive<=1){
          const winner=g.eliminated.findIndex(e=>!e);
          g.end(winner);
        }
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);
    const cx=g.ring.x,cy=g.ring.y,r=g.ring.r;
    ctx.fillStyle="rgba(99,245,154,.1)";
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#63f59a";ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    const e1x=cx+Math.cos(g.sweeper.ang)*r,e1y=cy+Math.sin(g.sweeper.ang)*r;
    const e2x=cx-Math.cos(g.sweeper.ang)*r,e2y=cy-Math.sin(g.sweeper.ang)*r;
    ctx.strokeStyle="#ff5878";ctx.lineWidth=8;
    ctx.beginPath();ctx.moveTo(e1x,e1y);ctx.lineTo(e2x,e2y);ctx.stroke();
    ctx.fillStyle="#ff5878";
    ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);ctx.fill();
    const n=g.players.length;
    for(let i=0;i<n;i++){
      const p=g.players[i];
      const ang=i/n*Math.PI*2;
      const px=cx+Math.cos(ang)*(r-14);
      const py=cy+Math.sin(ang)*(r-14);
      if(g.eliminated[i]){
        ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;
        ctx.beginPath();ctx.arc(px,py,16,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        continue;
      }
      const jump=g.jumpTimer[i]>0;
      const drawY=py-(jump?Math.sin((1-g.jumpTimer[i]/.4)*Math.PI)*20:0);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(px,drawY,16,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,px,drawY+4);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpColorMatch",title:"Color Match",desc:"When YOUR color flashes, press fast. Wrong press = penalty.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS WHEN YOUR COLOR IS SHOWN",
  init(g){
    g.targetColor=-1;
    g.phase="show";
    g.roundT=1.2;
    g.scores=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    if(g.phase==="show"){
      g.roundT-=dt;
      for(let i=0;i<g.players.length;i++){
        if(g.inputs[i].pa){
          if(i===g.targetColor){
            g.scores[i]++;
            if(g.scores[i]>=5){g.end(i);return;}
            g.phase="resolve";g.resolveT=.6;g.targetColor=-1;
            break;
          }else{
            g.scores[i]=Math.max(0,g.scores[i]-1);
            g.phase="resolve";g.resolveT=.6;g.targetColor=-1;
            break;
          }
        }
      }
      if(g.phase==="show"&&g.roundT<=0){
        g.phase="resolve";g.resolveT=.8;g.targetColor=-1;
      }
    }else{
      g.resolveT-=dt;
      if(g.resolveT<=0){
        g.targetColor=Math.floor(Math.random()*g.players.length);
        g.phase="show";
        g.roundT=Math.max(.7,1.2-Math.max(...g.scores)*.05);
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#13102a";ctx.fillRect(0,0,W,H);
    const COLOR_HEX=["#64eaff","#ff72c8","#ffe66d","#63f59a","#ff8c42","#b07aff"];
    const COLOR_NAMES=["CYAN","PINK","GOLD","GREEN","ORANGE","PURPLE"];
    if(g.phase==="show"&&g.targetColor>=0){
      ctx.fillStyle=COLOR_HEX[g.targetColor];
      ctx.globalAlpha=.25+Math.sin(g.t*8)*.15;
      ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=1;
      g.text(COLOR_NAMES[g.targetColor],W/2,H/2+20,90,COLOR_HEX[g.targetColor],"center");
    }else{
      g.text("WAIT...",W/2,H/2+20,40,"#9fc0ff","center");
    }
    const n=g.players.length;
    for(let i=0;i<n;i++){
      const p=g.players[i];
      const x=80+i*(W-160)/Math.max(1,n-1);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,440,22,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,445);ctx.textAlign="left";
      g.text(g.scores[i],x,478,16,COLOR_HEX[i],"center");
    }
  }
});

multiplayer({
  id:"mpBombPass",title:"Bomb Pass",desc:"Pass the bomb fast. If it explodes on you, you're out.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS YOUR KEY TO PASS THE BOMB",
  init(g){
    g.bomb={holder:Math.floor(Math.random()*g.players.length),fuse:6};
    g.eliminated=g.players.map(()=>false);
    g.alive=g.players.length;
    g.passFlash=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.bomb.fuse-=dt;
    for(let i=0;i<g.players.length;i++){
      if(g.eliminated[i])continue;
      g.passFlash[i]=Math.max(0,g.passFlash[i]-dt);
      if(g.inputs[i].pa&&g.bomb.holder===i){
        let next=(i+1)%g.players.length;
        while(g.eliminated[next]&&next!==i)next=(next+1)%g.players.length;
        if(next!==i){
          g.bomb.holder=next;
          g.bomb.fuse=Math.max(1.2,g.bomb.fuse-0.3);
          g.passFlash[i]=.2;
        }
      }
    }
    if(g.bomb.fuse<=0){
      const loser=g.bomb.holder;
      g.eliminated[loser]=true;
      g.finished[loser]=true;
      g.alive--;
      const p=g.players[loser];
      g.burst(W/2,H/2,p.color,40,500);
      g.banner=g.players[loser].name+" OUT!";
      g.bannerT=1.2;
      if(g.alive<=1){
        const winner=g.eliminated.findIndex(e=>!e);
        g.end(winner);
      }else{
        let next=0;
        while(g.eliminated[next])next++;
        g.bomb.holder=next;
        g.bomb.fuse=Math.max(2.5,6-g.alive*0.4);
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);
    for(let k=0;k<40;k++){ctx.fillStyle="#26386f";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    const n=g.players.length;
    const cx=W/2,cy=H/2+20,r=180;
    const danger=g.bomb.fuse<2;
    const pulse=danger?1+Math.sin(g.t*20)*.15:1;
    ctx.strokeStyle="rgba(255,255,255,.15)";ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<n;i++){
      const p=g.players[i];
      const ang=i/n*Math.PI*2-Math.PI/2;
      const px=cx+Math.cos(ang)*r;
      const py=cy+Math.sin(ang)*r;
      if(g.eliminated[i]){
        ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;
        ctx.beginPath();ctx.arc(px,py,26,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
        ctx.fillStyle="#6a72a8";ctx.font="bold 11px Courier New";ctx.textAlign="center";ctx.fillText("OUT",px,py+4);ctx.textAlign="left";
        continue;
      }
      if(g.bomb.holder===i&&danger){
        ctx.fillStyle=`rgba(255,100,100,${.4+Math.sin(g.t*20)*.3})`;
        ctx.beginPath();ctx.arc(px,py,38,0,Math.PI*2);ctx.fill();
      }
      if(g.passFlash[i]>0){
        ctx.fillStyle="rgba(255,255,255,"+g.passFlash[i]*3+")";
        ctx.beginPath();ctx.arc(px,py,34,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(px,py,26,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 14px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,px,py+5);
      ctx.font="10px Courier New";
      ctx.fillStyle=p.color;
      const keyLabel=p.keys.a===" "?"SPACE":p.keys.a.toUpperCase();
      ctx.fillText(keyLabel,px,py+46);ctx.textAlign="left";
    }
    ctx.fillStyle=danger&&Math.floor(g.t*20)%2?"#ff5878":"#1b1f3a";
    ctx.beginPath();ctx.arc(cx,cy,22*pulse,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx-6,cy-6,5,0,Math.PI*2);ctx.fill();
    g.text(g.bomb.fuse.toFixed(1)+"s",cx,cy+56,20,danger?"#ff5878":"#ffe66d","center");
  }
});

})();