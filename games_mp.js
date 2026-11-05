/* =====================================================
   MULTIPLAYER PACK — 3 five-key games (3P only)
   Sumo Showdown, Gem Grab, Battle Royale
===================================================== */
(function(){
"use strict";
const W=900,H=500;
if(!window.multiplayer)return;

multiplayer({
  id:"mpSumo",
  title:"Sumo Showdown",
  desc:"Push rivals off the shrinking ring. Last standing wins.",
  min:3,max:3,keysPerPlayer:5,
  hint:"LAST ONE ON THE RING WINS",
  init(g){
    g.ring={x:W/2,y:H/2+20,r:230};
    const n=g.players.length;
    for(let i=0;i<n;i++){
      const ang=i/n*Math.PI*2-Math.PI/2;
      const p=g.players[i];
      p.x=W/2+Math.cos(ang)*150;
      p.y=H/2+20+Math.sin(ang)*150;
      p.r=20;
      p.dash=0;p.dashCd=0;p.ddx=1;p.ddy=0;
    }
  },
  update(g,dt){
    g.ring.r=Math.max(90,g.ring.r-dt*8);
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i],I=g.inputs[i];
      if(!p.alive)continue;
      p.dashCd=Math.max(0,p.dashCd-dt);
      if(p.dash>0){
        p.dash-=dt;
        p.x+=p.ddx*600*dt;p.y+=p.ddy*600*dt;
      }else{
        const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
        const l=Math.hypot(ax,ay)||1;
        p.x+=ax/l*220*dt;p.y+=ay/l*220*dt;
        if(I.pa&&p.dashCd<=0&&(ax||ay)){p.dash=.15;p.dashCd=1.2;p.ddx=ax/l;p.ddy=ay/l;}
      }
      const dx=p.x-g.ring.x,dy=p.y-g.ring.y;
      const d=Math.hypot(dx,dy);
      if(d>g.ring.r-p.r){
        p.alive=false;
        g.finished[i]=true;
        g.burst(p.x,p.y,p.color,20,400);
        g.done();
      }
    }
    for(let a=0;a<g.players.length;a++)for(let b=a+1;b<g.players.length;b++){
      const pa=g.players[a],pb=g.players[b];
      if(!pa.alive||!pb.alive)continue;
      const dx=pb.x-pa.x,dy=pb.y-pa.y,d=Math.hypot(dx,dy);
      if(d<pa.r+pb.r&&d>0){
        const nx=dx/d,ny=dy/d,ov=(pa.r+pb.r-d)/2;
        pa.x-=nx*ov;pa.y-=ny*ov;pb.x+=nx*ov;pb.y+=ny*ov;
        if(pa.dash>0){pb.x+=nx*30;pb.y+=ny*30;pa.dash=0;}
        if(pb.dash>0){pa.x-=nx*30;pa.y-=ny*30;pb.dash=0;}
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#1a1230";ctx.fillRect(0,0,W,H);
    for(let k=0;k<30;k++){ctx.fillStyle="#26386f";ctx.fillRect((k*97)%W,(k*61)%H,2,2);}
    const gr=ctx.createRadialGradient(g.ring.x,g.ring.y,g.ring.r*.5,g.ring.x,g.ring.y,g.ring.r);
    gr.addColorStop(0,"rgba(99,245,154,.15)");
    gr.addColorStop(1,"rgba(255,90,120,.4)");
    ctx.fillStyle=gr;
    ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#ff5a78";ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.stroke();
    for(const p of g.players){
      if(!p.alive)continue;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";
      ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+4);ctx.textAlign="left";
    }
  }
});

multiplayer({
  id:"mpGems",
  title:"Gem Grab",
  desc:"Race to collect the most gems. 30 seconds.",
  min:3,max:3,keysPerPlayer:5,
  hint:"COLLECT THE MOST GEMS — 30 SECONDS",
  init(g){
    g.tl=30;
    g.gems=[];
    for(let i=0;i<15;i++)g.gems.push({x:50+Math.random()*(W-100),y:80+Math.random()*(H-140),r:10});
    for(const p of g.players){
      p.x=50+Math.random()*(W-100);
      p.y=80+Math.random()*(H-140);
      p.r=15;
    }
  },
  update(g,dt){
    g.tl-=dt;
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i],I=g.inputs[i];
      const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay)||1;
      p.x+=ax/l*280*dt;p.y+=ay/l*280*dt;
      p.x=Math.max(20,Math.min(W-20,p.x));
      p.y=Math.max(60,Math.min(H-20,p.y));
      for(const gem of g.gems){
        if(gem.got)continue;
        if(Math.hypot(p.x-gem.x,p.y-gem.y)<p.r+gem.r){
          gem.got=true;p.score+=1;
          g.burst(gem.x,gem.y,"#ffe66d",8,200);
        }
      }
    }
    g.gems=g.gems.filter(x=>!x.got);
    if(g.gems.length<5&&Math.random()<.02){
      g.gems.push({x:50+Math.random()*(W-100),y:80+Math.random()*(H-140),r:10});
    }
    if(g.tl<=0){
      let best=-1,bestScore=-1;
      let tie=false;
      for(let i=0;i<g.players.length;i++){
        if(g.players[i].score>bestScore){bestScore=g.players[i].score;best=i;tie=false;}
        else if(g.players[i].score===bestScore)tie=true;
      }
      g.end(tie?-1:best);
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a0a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){
      if(((x+y)/50)%2===0){ctx.fillStyle="#0f2410";ctx.fillRect(x,y,50,50);}
    }
    for(const gem of g.gems){
      ctx.fillStyle="#ffe66d";
      ctx.beginPath();
      ctx.moveTo(gem.x,gem.y-gem.r);
      ctx.lineTo(gem.x+gem.r,gem.y);
      ctx.lineTo(gem.x,gem.y+gem.r);
      ctx.lineTo(gem.x-gem.r,gem.y);
      ctx.closePath();ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=2;ctx.stroke();
    }
    for(const p of g.players){
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+4);ctx.textAlign="left";
    }
    ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,40);
    ctx.font="bold 14px Courier New";ctx.textAlign="left";
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      ctx.fillStyle=p.color;
      ctx.fillText(`${p.name}: ${p.score}`,30+i*130,25);
    }
    ctx.fillStyle="#ffe66d";ctx.textAlign="center";
    ctx.fillText(Math.max(0,Math.ceil(g.tl))+"s",W/2,25);ctx.textAlign="left";
  }
});

multiplayer({
  id:"mpBattle",
  title:"Battle Royale",
  desc:"Everyone against everyone. Last standing wins.",
  min:3,max:3,keysPerPlayer:5,
  hint:"ELIMINATE ALL RIVALS — LAST STANDING WINS",
  init(g){
    for(const p of g.players){
      p.x=50+Math.random()*(W-100);
      p.y=80+Math.random()*(H-100);
      p.r=15;p.hp=3;p.cd=0;p.ang=0;p.kills=0;
    }
    g.bullets=[];
  },
  update(g,dt){
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i],I=g.inputs[i];
      if(!p.alive)continue;
      p.cd=Math.max(0,p.cd-dt);
      const ax=(I.r?1:0)-(I.l?1:0),ay=(I.d?1:0)-(I.u?1:0);
      const l=Math.hypot(ax,ay)||1;
      if(l>0){p.ang=Math.atan2(ay,ax);}
      p.x+=ax/l*220*dt;p.y+=ay/l*220*dt;
      p.x=Math.max(20,Math.min(W-20,p.x));
      p.y=Math.max(60,Math.min(H-20,p.y));
      if(I.pa&&p.cd<=0){
        p.cd=.5;
        g.bullets.push({x:p.x+Math.cos(p.ang)*18,y:p.y+Math.sin(p.ang)*18,
          vx:Math.cos(p.ang)*420,vy:Math.sin(p.ang)*420,o:i,life:1.2});
      }
    }
    for(const b of g.bullets){
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0||b.x<0||b.x>W||b.y<60||b.y>H)b.dead=true;
      for(let j=0;j<g.players.length;j++){
        if(j===b.o)continue;
        const t=g.players[j];
        if(!t.alive)continue;
        if(Math.hypot(b.x-t.x,b.y-t.y)<t.r+4){
          b.dead=true;t.hp--;
          g.burst(t.x,t.y,t.color,10,240);
          if(t.hp<=0){t.alive=false;g.finished[j]=true;g.burst(t.x,t.y,t.color,25,400);g.done();}
          break;
        }
      }
    }
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=40)for(let y=60;y<H;y+=40){
      if(((x+y)/40)%2===0){ctx.fillStyle="#141c40";ctx.fillRect(x,y,40,40);}
    }
    ctx.strokeStyle="#64eaff";ctx.lineWidth=2;ctx.strokeRect(2,58,W-4,H-62);
    for(const b of g.bullets){
      ctx.fillStyle="#ffe66d";
      ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();
    }
    for(const p of g.players){
      if(!p.alive)continue;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle="#fff";ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x+Math.cos(p.ang)*22,p.y+Math.sin(p.ang)*22);ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+4);ctx.textAlign="left";
      ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-20,p.y-30,40,4);
      ctx.fillStyle="#63f59a";ctx.fillRect(p.x-20,p.y-30,40*(p.hp/3),4);
    }
    ctx.fillStyle="#080b18";ctx.fillRect(0,0,W,58);
    ctx.font="bold 13px Courier New";ctx.textAlign="left";
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      ctx.fillStyle=p.color;
      ctx.fillText(`${p.name} HP:${Math.max(0,p.hp)}`,20+i*130,24);
    }
  }
});

})();