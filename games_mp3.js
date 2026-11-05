/* =====================================================
   MULTIPLAYER PACK 3 — 8 one-key games (3-6P)
===================================================== */
(function(){
"use strict";
const W=900,H=500;
if(!window.multiplayer)return;
const GOLD="#ffe66d";

multiplayer({
  id:"mpArrowAssault",title:"Arrow Assault",desc:"Dodge incoming arrows. Press to attack.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO DODGE/SHOOT — ARROWS FLY ACROSS",
  init(g){g.arrows=[];g.spawnT=1;g.players.forEach(p=>{p.hp=3;p.inv=0;});},
  update(g,dt){
    g.spawnT-=dt;
    if(g.spawnT<=0){
      g.spawnT=Math.max(.4,1.5-g.t*.02);
      const side=Math.random()<.5?0:1;
      const y=rnd(80,H-40);
      g.arrows.push({x:side?-40:W+40,y,vx:side?300:-300});
    }
    g.arrows.forEach(a=>{
      a.x+=a.vx*dt;
      g.players.forEach((p,i)=>{
        if(p.hp<=0||p.inv>0)return;
        const x=W/(g.players.length+1)*(i+1);
        const y=H-60;
        if(Math.abs(a.x-x)<20&&Math.abs(a.y-y)<20){
          p.hp--;p.inv=1;
          g.burst(x,y,p.color,15,300);
          if(p.hp<=0){g.finished[i]=true;g.done();}
        }
      });
    });
    g.arrows=g.arrows.filter(a=>a.x>-60&&a.x<W+60);
    g.players.forEach((p,i)=>{
      if(p.hp<=0)return;
      p.inv=Math.max(0,p.inv-dt);
      if(g.inputs[i].pa)g.burst(W/(g.players.length+1)*(i+1),H-70,p.color,8,200);
    });
    function rnd(a,b){return a+Math.random()*(b-a);}
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1a2a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=60)for(let y=60;y<H;y+=60){
      if(((x+y)/60)%2===0){ctx.fillStyle="#142440";ctx.fillRect(x,y,60,60);}
    }
    g.arrows.forEach(a=>{
      ctx.fillStyle="#ff5a78";
      ctx.beginPath();ctx.moveTo(a.x,a.y);
      ctx.lineTo(a.x+(a.vx>0?-20:20),a.y-8);
      ctx.lineTo(a.x+(a.vx>0?-20:20),a.y+8);
      ctx.closePath();ctx.fill();
    });
    g.players.forEach((p,i)=>{
      const x=W/(g.players.length+1)*(i+1);
      const y=H-60;
      if(p.hp<=0){ctx.fillStyle="#2a2f63";ctx.globalAlpha=.4;ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
      ctx.globalAlpha=p.inv>0&&Math.floor(p.inv*20)%2?.3:1;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.globalAlpha=1;
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,x,y+5);ctx.textAlign="left";
      g.text("♥"+p.hp,x,y+45,12,p.color,"center");
    });
  }
});

multiplayer({
  id:"mpHexPusher",title:"Hex Pusher",desc:"Hexagonal arena. Push rivals off the edge.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO DASH AT NEAREST RIVAL",
  init(g){
    g.arena={x:W/2,y:H/2+20,r:220};
    const n=g.players.length;
    g.players.forEach((p,i)=>{
      const ang=i/n*Math.PI*2-Math.PI/2;
      p.x=W/2+Math.cos(ang)*150;
      p.y=H/2+20+Math.sin(ang)*150;
      p.vx=0;p.vy=0;p.r=20;p.dash=0;p.dashCd=0;p.alive=true;
    });
  },
  update(g,dt){
    g.arena.r=Math.max(100,g.arena.r-dt*4);
    g.players.forEach((p,i)=>{
      if(!p.alive)return;
      p.dashCd=Math.max(0,p.dashCd-dt);
      if(p.dash>0){p.dash-=dt;p.x+=p.ddx*600*dt;p.y+=p.ddy*600*dt;}
      else if(g.inputs[i].pa&&p.dashCd<=0){
        let nearest=null,nd=Infinity;
        g.players.forEach((q,j)=>{
          if(j===i||!q.alive)return;
          const d=Math.hypot(q.x-p.x,q.y-p.y);
          if(d<nd){nd=d;nearest=q;}
        });
        if(nearest){
          const dx=nearest.x-p.x,dy=nearest.y-p.y,d=Math.hypot(dx,dy)||1;
          p.dash=.2;p.dashCd=1;p.ddx=dx/d;p.ddy=dy/d;
        }
      }
      if(Math.hypot(p.x-g.arena.x,p.y-g.arena.y)>g.arena.r){
        p.alive=false;g.finished[i]=true;
        g.burst(p.x,p.y,p.color,20,400);
        g.done();
      }
    });
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
    const gr=ctx.createRadialGradient(g.arena.x,g.arena.y,g.arena.r*.6,g.arena.x,g.arena.y,g.arena.r);
    gr.addColorStop(0,"rgba(255,140,66,.15)");
    gr.addColorStop(1,"rgba(255,90,120,.5)");
    ctx.fillStyle=gr;
    ctx.beginPath();
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3-Math.PI/6;
      const x=g.arena.x+Math.cos(a)*g.arena.r;
      const y=g.arena.y+Math.sin(a)*g.arena.r;
      if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.fill();
    ctx.strokeStyle="#ff5a78";ctx.lineWidth=5;ctx.stroke();
    g.players.forEach(p=>{
      if(!p.alive)return;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+4);ctx.textAlign="left";
    });
  }
});

multiplayer({
  id:"mpTagTeam",title:"Tag Team",desc:"Whoever is 'IT' tries to tag. Time runs out.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO MOVE — THE 'IT' PLAYER CHASES OTHERS",
  init(g){
    g.it=0;g.tl=20;g.stepT=0;
    g.players.forEach((p,i)=>{
      const ang=i/g.players.length*Math.PI*2;
      p.x=W/2+Math.cos(ang)*150;
      p.y=H/2+20+Math.sin(ang)*150;
      p.vx=0;p.vy=0;
    });
  },
  update(g,dt){
    g.tl-=dt;g.stepT-=dt;
    g.players.forEach((p,i)=>{
      if(g.stepT<=0&&g.inputs[i].pa){
        const itPlayer=g.players[g.it];
        const dx=itPlayer.x-p.x,dy=itPlayer.y-p.y,d=Math.hypot(dx,dy)||1;
        const speed=i===g.it?60:-60;
        p.vx=dx/d*speed*4;p.vy=dy/d*speed*4;
      }
      p.x=Math.max(40,Math.min(W-40,p.x+p.vx*dt));
      p.y=Math.max(80,Math.min(H-40,p.y+p.vy*dt));
      p.vx*=.85;p.vy*=.85;
    });
    if(g.stepT<=0)g.stepT=.15;
    const itP=g.players[g.it];
    g.players.forEach((p,i)=>{
      if(i===g.it)return;
      if(Math.hypot(p.x-itP.x,p.y-itP.y)<32){
        g.it=i;
        g.burst(p.x,p.y,p.color,15,300);
      }
    });
    if(g.tl<=0)g.end((g.it+1)%g.players.length);
  },
  draw(g,ctx){
    ctx.fillStyle="#1a2a1a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=50)for(let y=0;y<H;y+=50){
      if(((x+y)/50)%2===0){ctx.fillStyle="#223a22";ctx.fillRect(x,y,50,50);}
    }
    g.players.forEach((p,i)=>{
      const isIt=i===g.it;
      if(isIt){
        ctx.fillStyle="rgba(255,90,120,.3)";
        ctx.beginPath();ctx.arc(p.x,p.y,28+Math.sin(g.t*8)*4,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+5);ctx.textAlign="left";
      if(isIt){ctx.fillStyle="#ff2244";ctx.font="bold 14px Courier New";ctx.textAlign="center";ctx.fillText("IT",p.x,p.y-30);ctx.textAlign="left";}
    });
    g.text(Math.max(0,Math.ceil(g.tl))+"s",W/2,30,24,g.tl<5?"#ff2244":GOLD,"center");
  }
});

multiplayer({
  id:"mpDeathmatch",title:"Deathmatch",desc:"All vs all. Last one standing wins.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO SHOOT AT NEAREST RIVAL",
  init(g){
    g.bullets=[];
    g.players.forEach((p,i)=>{
      const ang=i/g.players.length*Math.PI*2;
      p.x=W/2+Math.cos(ang)*200;
      p.y=H/2+20+Math.sin(ang)*200;
      p.hp=3;p.cd=0;p.alive=true;
    });
  },
  update(g,dt){
    g.players.forEach((p,i)=>{
      if(!p.alive)return;
      p.cd=Math.max(0,p.cd-dt);
      if(g.inputs[i].pa&&p.cd<=0){
        p.cd=.5;
        let nearest=null,nd=Infinity;
        g.players.forEach((q,j)=>{
          if(j===i||!q.alive)return;
          const d=Math.hypot(q.x-p.x,q.y-p.y);
          if(d<nd){nd=d;nearest=q;}
        });
        if(nearest){
          const dx=nearest.x-p.x,dy=nearest.y-p.y,d=Math.hypot(dx,dy)||1;
          g.bullets.push({x:p.x,y:p.y,vx:dx/d*400,vy:dy/d*400,o:i,life:1.5});
        }
      }
    });
    g.bullets.forEach(b=>{
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
      if(b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H)b.dead=true;
      g.players.forEach((p,i)=>{
        if(i===b.o||!p.alive||b.dead)return;
        if(Math.hypot(b.x-p.x,b.y-p.y)<18){
          b.dead=true;p.hp--;
          g.burst(p.x,p.y,p.color,12,300);
          if(p.hp<=0){p.alive=false;g.finished[i]=true;g.done();}
        }
      });
    });
    g.bullets=g.bullets.filter(b=>!b.dead);
  },
  draw(g,ctx){
    ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=40)for(let y=0;y<H;y+=40){
      if(((x+y)/40)%2===0){ctx.fillStyle="#141c40";ctx.fillRect(x,y,40,40);}
    }
    g.bullets.forEach(b=>{ctx.fillStyle=g.players[b.o].color;ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();});
    g.players.forEach(p=>{
      if(!p.alive){ctx.fillStyle="#2a2f63";ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+5);ctx.textAlign="left";
      ctx.fillStyle="#2a2f63";ctx.fillRect(p.x-20,p.y-30,40,4);
      ctx.fillStyle=p.hp>2?"#63f59a":p.hp>1?GOLD:"#ff2244";
      ctx.fillRect(p.x-20,p.y-30,40*(p.hp/3),4);
    });
  }
});

multiplayer({
  id:"mpBossRush",title:"Boss Rush",desc:"CO-OP! Everyone vs the boss. Survive to win.",
  min:3,max:6,keysPerPlayer:1,
  hint:"CO-OP: ALL PRESS TO SHOOT THE BOSS",
  init(g){
    g.boss={x:W/2,y:120,hp:100,r:50,cd:0,attack:0};
    g.bullets=[];
    g.players.forEach((p,i)=>{
      const x=W/(g.players.length+1)*(i+1);
      p.x=x;p.y=H-60;p.hp=3;p.cd=0;p.alive=true;
    });
  },
  update(g,dt){
    const b=g.boss;
    if(b.hp<=0){g.end(-2);return;}
    b.cd=Math.max(0,b.cd-dt);
    b.attack+=dt;
    if(b.attack>1.5){
      b.attack=0;
      const target=g.players[ri(0,g.players.length-1)];
      if(target&&target.alive){
        const dx=target.x-b.x,dy=target.y-b.y,d=Math.hypot(dx,dy)||1;
        g.bullets.push({x:b.x,y:b.y,vx:dx/d*300,vy:dy/d*300,from:"boss",life:3});
      }
    }
    g.players.forEach((p,i)=>{
      if(!p.alive)return;
      p.cd=Math.max(0,p.cd-dt);
      if(g.inputs[i].pa&&p.cd<=0){
        p.cd=.4;
        g.bullets.push({x:p.x,y:p.y-20,vx:0,vy:-500,from:i,life:1.5});
      }
    });
    g.bullets.forEach(bu=>{
      bu.x+=bu.vx*dt;bu.y+=bu.vy*dt;bu.life-=dt;
      if(bu.life<=0||bu.x<0||bu.x>W||bu.y<0||bu.y>H)bu.dead=true;
      if(bu.from==="boss"){
        g.players.forEach((p,i)=>{
          if(!p.alive||bu.dead)return;
          if(Math.hypot(bu.x-p.x,bu.y-p.y)<20){
            bu.dead=true;p.hp--;
            g.burst(p.x,p.y,p.color,12,300);
            if(p.hp<=0){p.alive=false;g.finished[i]=true;
              if(g.players.every(x=>!x.alive))g.end(1);
            }
          }
        });
      }else if(!bu.dead&&Math.hypot(bu.x-b.x,bu.y-b.y)<b.r){
        bu.dead=true;b.hp-=2;
        g.burst(bu.x,bu.y,GOLD,10,200);
      }
    });
    g.bullets=g.bullets.filter(bu=>!bu.dead);
    function ri(a,b){return Math.floor(a+Math.random()*(b-a+1));}
  },
  draw(g,ctx){
    ctx.fillStyle="#1a0a1a";ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=60)for(let y=0;y<H;y+=60){
      if(((x+y)/60)%2===0){ctx.fillStyle="#20081c";ctx.fillRect(x,y,60,60);}
    }
    const b=g.boss;
    ctx.fillStyle="#c04aff";
    ctx.beginPath();
    for(let k=0;k<8;k++){
      const ang=k*Math.PI/4+g.t*.5;
      const r=b.r*(k%2?.8:1)+Math.sin(g.t*3+k)*4;
      const x=b.x+Math.cos(ang)*r,y=b.y+Math.sin(ang)*r;
      if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.fill();
    ctx.strokeStyle="#4a1a6a";ctx.lineWidth=4;ctx.stroke();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(b.x-15,b.y-10,8,0,Math.PI*2);ctx.arc(b.x+15,b.y-10,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#111";ctx.beginPath();ctx.arc(b.x-15,b.y-10,4,0,Math.PI*2);ctx.arc(b.x+15,b.y-10,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#080b18";ctx.fillRect(W/2-200,20,400,16);
    ctx.fillStyle="#c04aff";ctx.fillRect(W/2-198,22,396*Math.max(0,b.hp)/100,12);
    ctx.strokeStyle="#c04aff";ctx.lineWidth=2;ctx.strokeRect(W/2-200,20,400,16);
    g.text("BOSS "+Math.max(0,b.hp)+"/100",W/2,16,12,"#fff","center");
    g.bullets.forEach(bu=>{
      ctx.fillStyle=bu.from==="boss"?"#ff2244":g.players[bu.from].color;
      ctx.beginPath();ctx.arc(bu.x,bu.y,6,0,Math.PI*2);ctx.fill();
    });
    g.players.forEach((p,i)=>{
      if(!p.alive){ctx.fillStyle="#2a2f63";ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 12px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+5);ctx.textAlign="left";
      g.text("♥"+p.hp,p.x,p.y+45,12,p.color,"center");
    });
  }
});

multiplayer({
  id:"mpWhack",title:"Whack Pro",desc:"Targets appear on YOUR tile. Press fast.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS WHEN YOUR TILE HAS A TARGET",
  init(g){
    g.targetActive=-1;
    g.activeT=1.5;
    g.scores=new Array(g.players.length).fill(0);
    g.lock=new Array(g.players.length).fill(0);
  },
  update(g,dt){
    g.activeT-=dt;
    if(g.activeT<=0){
      g.targetActive=Math.floor(Math.random()*g.players.length);
      g.activeT=Math.max(.8,1.5-Math.max(...g.scores)*.05);
    }
    for(let i=0;i<g.players.length;i++){
      g.lock[i]=Math.max(0,g.lock[i]-dt);
      if(g.lock[i]>0)continue;
      if(g.inputs[i].pa){
        if(i===g.targetActive){
          g.scores[i]++;
          g.burst(W/(g.players.length+1)*(i+1),H/2,g.players[i].color,15,300);
          g.targetActive=-1;g.activeT=.4;
          if(g.scores[i]>=5){g.end(i);return;}
        }else g.lock[i]=1;
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#2a5a2a";ctx.fillRect(0,0,W,H);
    for(let i=0;i<g.players.length;i++){
      const p=g.players[i];
      const x=W/(g.players.length+1)*(i+1);
      const isActive=i===g.targetActive;
      ctx.fillStyle=isActive?p.color:"#1a3a1a";
      ctx.beginPath();ctx.arc(x,H/2,60,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=p.color;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x,H/2,60,0,Math.PI*2);ctx.stroke();
      if(isActive){
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,H/2,30,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.font="bold 30px Courier New";ctx.textAlign="center";
        ctx.fillText("!",x,H/2+12);ctx.textAlign="left";
      }
      g.text(p.name,x,80,20,p.color,"center");
      g.text(g.scores[i]+"/5",x,110,16,"#fff","center");
    }
  }
});

multiplayer({
  id:"mpEscape",title:"Escape the Ring",desc:"Ring shrinks. Stay inside. Push rivals out.",
  min:3,max:6,keysPerPlayer:1,
  hint:"PRESS TO DASH — LAST ONE INSIDE THE RING WINS",
  init(g){
    g.ring={x:W/2,y:H/2+20,r:250};
    g.players.forEach((p,i)=>{
      const ang=i/g.players.length*Math.PI*2;
      p.x=W/2+Math.cos(ang)*140;
      p.y=H/2+20+Math.sin(ang)*140;
      p.vx=0;p.vy=0;p.r=18;p.alive=true;p.dash=0;p.dashCd=0;
    });
  },
  update(g,dt){
    g.ring.r=Math.max(60,g.ring.r-dt*7);
    g.players.forEach((p,i)=>{
      if(!p.alive)return;
      p.dashCd=Math.max(0,p.dashCd-dt);
      if(p.dash>0){p.dash-=dt;p.x+=p.ddx*500*dt;p.y+=p.ddy*500*dt;}
      else if(g.inputs[i].pa&&p.dashCd<=0){
        let nearest=null,nd=Infinity;
        g.players.forEach((q,j)=>{
          if(j===i||!q.alive)return;
          const d=Math.hypot(q.x-p.x,q.y-p.y);
          if(d<nd){nd=d;nearest=q;}
        });
        if(nearest){
          const dx=nearest.x-p.x,dy=nearest.y-p.y,d=Math.hypot(dx,dy)||1;
          p.dash=.15;p.dashCd=1;p.ddx=dx/d;p.ddy=dy/d;
        }
      }
      if(Math.hypot(p.x-g.ring.x,p.y-g.ring.y)>g.ring.r){
        p.alive=false;g.finished[i]=true;
        g.burst(p.x,p.y,p.color,20,400);
        g.done();
      }
    });
    for(let a=0;a<g.players.length;a++)for(let b=a+1;b<g.players.length;b++){
      const pa=g.players[a],pb=g.players[b];
      if(!pa.alive||!pb.alive)continue;
      const dx=pb.x-pa.x,dy=pb.y-pa.y,d=Math.hypot(dx,dy);
      if(d<pa.r+pb.r&&d>0){
        const nx=dx/d,ny=dy/d,ov=(pa.r+pb.r-d)/2;
        pa.x-=nx*ov;pa.y-=ny*ov;pb.x+=nx*ov;pb.y+=ny*ov;
        if(pa.dash>0){pb.x+=nx*40;pb.y+=ny*40;pa.dash=0;}
        if(pb.dash>0){pa.x-=nx*40;pa.y-=ny*40;pb.dash=0;}
      }
    }
  },
  draw(g,ctx){
    ctx.fillStyle="#0a1020";ctx.fillRect(0,0,W,H);
    const gr=ctx.createRadialGradient(g.ring.x,g.ring.y,g.ring.r*.6,g.ring.x,g.ring.y,g.ring.r);
    gr.addColorStop(0,"rgba(99,245,154,.1)");
    gr.addColorStop(1,"rgba(255,90,120,.5)");
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#ff5a78";ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(g.ring.x,g.ring.y,g.ring.r,0,Math.PI*2);ctx.stroke();
    g.players.forEach(p=>{
      if(!p.alive)return;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#080b18";ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 11px Courier New";ctx.textAlign="center";
      ctx.fillText(p.name,p.x,p.y+4);ctx.textAlign="left";
    });
  }
});

})();