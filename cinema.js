/* MagischeRadar 4.0: realtime, interactieve animatiefilmwereld.
   Werkt zonder externe libraries, naast de optionele 3D-personages. */
(()=>{'use strict';
const stage=document.querySelector('.map-stage'),camera=document.getElementById('mapCamera');
if(!stage||!camera)return;
const canvas=document.createElement('canvas');canvas.id='cinemaCanvas';canvas.setAttribute('aria-hidden','true');camera.insertBefore(canvas,camera.querySelector('svg'));
const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;canvas.width=1536;canvas.height=1024;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const W=1536,H=1024,TAU=Math.PI*2;
let state={x:750,y:420,progress:.28,theme:'sint',magic:'spannend',stop:'',arrival:false,preview:false},last=0,scene=0,prevStop='',particles=[],meteors=[];
const rand=(n)=>{let x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)};
const cloudlets=Array.from({length:9},(_,i)=>({x:rand(i+1)*1800-100,y:65+rand(i+22)*640,size:70+rand(i+11)*105,speed:2.4+rand(i+61)*4,alpha:.13+rand(i+8)*.12}));
const houses=[{x:445,y:300,s:1.0},{x:650,y:365,s:.72},{x:940,y:430,s:.88},{x:1150,y:690,s:.82},{x:700,y:730,s:.9},{x:1190,y:225,s:.75},{x:350,y:605,s:.76}];
const trees=Array.from({length:24},(_,i)=>({x:235+rand(i+30)*1100,y:170+rand(i+70)*680,s:.55+rand(i+10)*.65,phase:i*.81}));
const fireflies=Array.from({length:75},(_,i)=>({x:rand(i+100)*W,y:rand(i+200)*H,p:i*2.32,v:3+rand(i+400)*8}));
const lights=Array.from({length:30},(_,i)=>({x:rand(i+500)*W,y:rand(i+600)*H,p:i*.67}));
const windmills=[{x:490,y:530,s:.83},{x:1070,y:325,s:.66}];
const lerp=(a,b,t)=>a+(b-a)*t;
function line(x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function glow(x,y,r,color){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
function cloud(c,t){const x=((c.x+t*c.speed/1000+180)%1920)-180;ctx.save();ctx.translate(x,c.y+Math.sin(t/3200+c.x)*13);ctx.scale(c.size/95,c.size/95);const g=ctx.createRadialGradient(0,0,5,0,0,115);g.addColorStop(0,`rgba(246,248,255,${c.alpha})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*34,Math.sin(i*2)*8,77,32,0,0,TAU);ctx.fill()}ctx.restore()}
function house(h,t){ctx.save();ctx.translate(h.x,h.y);ctx.scale(h.s,h.s);ctx.globalAlpha=.72;glow(0,0,85,'rgba(255,209,79,.16)');ctx.fillStyle='#183c72';ctx.fillRect(-30,-26,60,45);ctx.fillStyle='#703f6b';ctx.beginPath();ctx.moveTo(-38,-26);ctx.lineTo(0,-57);ctx.lineTo(38,-26);ctx.closePath();ctx.fill();const lit=.7+.3*Math.sin(t/800+h.x);ctx.fillStyle=`rgba(255,222,112,${lit})`;ctx.fillRect(-21,-15,14,16);ctx.fillRect(9,-15,14,16);ctx.fillStyle='#422b57';ctx.fillRect(-4,0,12,19);ctx.restore()}
function tree(tr,t){ctx.save();ctx.translate(tr.x,tr.y);ctx.scale(tr.s,tr.s);const sway=Math.sin(t/1400+tr.phase)*4;line(0,8,0,-29,'#513b56',7);ctx.fillStyle='#1a716a';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(sway*(i+1)/3,-30-i*13,24-i*4,21,0,0,TAU);ctx.fill()}ctx.restore()}
function mill(m,t){ctx.save();ctx.translate(m.x,m.y);ctx.scale(m.s,m.s);ctx.globalAlpha=.7;ctx.fillStyle='#ead3a3';ctx.beginPath();ctx.moveTo(-22,40);ctx.lineTo(-14,-45);ctx.lineTo(14,-45);ctx.lineTo(22,40);ctx.closePath();ctx.fill();ctx.fillStyle='#7c4d63';ctx.beginPath();ctx.moveTo(-23,-43);ctx.lineTo(0,-69);ctx.lineTo(23,-43);ctx.closePath();ctx.fill();ctx.save();ctx.translate(0,-39);ctx.rotate(t/3500);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillStyle='#f2e2bb';ctx.fillRect(-5,-72,10,61);ctx.strokeStyle='#785e78';ctx.lineWidth=2;ctx.strokeRect(-5,-72,10,61)}ctx.restore();ctx.restore()}
function comet(t){if(rand(Math.floor(t/11000)+222)<.42&&meteors.length<2&&Math.floor(t/11000)!==scene){scene=Math.floor(t/11000);meteors.push({x:300+rand(scene)*1000,y:70+rand(scene+2)*300,life:1})}meteors=meteors.filter(m=>m.life>0);for(const m of meteors){let g=ctx.createLinearGradient(m.x,m.y,m.x-130,m.y-75);g.addColorStop(0,'rgba(255,251,208,.85)');g.addColorStop(1,'transparent');line(m.x-130,m.y-75,m.x,m.y,'rgba(255,245,193,.4)',4);glow(m.x,m.y,23,'rgba(255,244,172,.6)');m.x+=8;m.y+=4;m.life-=.016}}
function spawn(x,y,n=24,arrival=false){if(reduced.matches)return;for(let i=0;i<n;i++){const a=rand(i+performance.now())*TAU,sp=(arrival?2.5:1.4)+rand(i+3)*4;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,life:1,kind:i%3,hue:(i*43+Math.floor(x))%360})}if(particles.length>500)particles.splice(0,particles.length-500)}
function updateParticles(){particles=particles.filter(p=>p.life>0);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.065;p.life-=.013;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=`hsl(${p.hue} 100% 75%)`;ctx.save();ctx.translate(p.x,p.y);ctx.rotate((1-p.life)*5);if(p.kind===0){ctx.fillRect(-3,-3,6,6)}else{circle(0,0,2.5,'#fff5b8');line(-6,0,6,0,'#fff0a0',1.5);line(0,-6,0,6,'#fff0a0',1.5)}ctx.restore()}ctx.globalAlpha=1}
function characterTrail(t){const {x,y,magic,theme}=state;const factor=magic==='rustig'?.45:magic==='extra'?1.4:1;const flying=theme==='fee'||theme==='kerst';const px=x,py=y-(flying?110:75);const n=Math.round(15*factor);for(let i=0;i<n;i++){const age=i/n;const tx=px-35-age*170,ty=py+Math.sin(t/400+i*.65)*8+age*45;const a=(1-age)*(.24+.4*factor);glow(tx,ty,8+age*10,`rgba(255,222,103,${a*.5})`);circle(tx,ty,Math.max(1,(1-age)*3.2),`rgba(255,241,160,${a})`)}if(magic==='extra')for(let i=0;i<5;i++){const a=t/900+i*TAU/5;glow(px+Math.cos(a)*80,py+Math.sin(a)*65,23,'rgba(255,219,112,.22)')}}
function render(t){requestAnimationFrame(render);if(document.hidden)return;if(t-last<30)return;const dt=t-last;last=t;ctx.clearRect(0,0,W,H);if(reduced.matches)return;const intensity=state.magic==='rustig'?.48:state.magic==='extra'?1.2:1;
 // Doorlopende omgeving: wolken, dorpjes, bomen, molens, sterren en vuurvliegjes.
 cloudlets.forEach(c=>cloud(c,t));houses.forEach(h=>house(h,t));trees.forEach(tr=>tree(tr,t));windmills.forEach(m=>mill(m,t));
 ctx.save();ctx.globalCompositeOperation='screen';lights.forEach(l=>{const a=.3+.25*Math.sin(t/850+l.p);glow(l.x,l.y,19,`rgba(255,222,126,${a*intensity})`)});
 fireflies.forEach(f=>{const x=f.x+Math.sin(t/1500+f.p)*23,y=f.y+Math.cos(t/1700+f.p)*18,a=(.1+.3*(1+Math.sin(t/550+f.p))*.5)*intensity;glow(x,y,11,`rgba(255,242,162,${a})`);circle(x,y,1.2,`rgba(255,253,205,${a})`)});characterTrail(t);comet(t);updateParticles();ctx.restore();
 if(state.arrival){glow(state.x,state.y,110+Math.sin(t/300)*25,'rgba(255,236,127,.23)');if(t%550<40&&state.magic!=='rustig')spawn(state.x,state.y,12,true)}
 }
requestAnimationFrame(render);
window.addEventListener('magischeradar:journey',e=>{const d=e.detail||{};const arrived=d.progress>=.999;const stop=d.stop||'';if(stop!==prevStop&&prevStop&&d.preview&&d.magic!=='rustig')spawn(d.x,d.y,27);if(arrived&&!state.arrival&&d.magic!=='rustig')spawn(d.x,d.y,110,true);prevStop=stop;state={...state,...d,arrival:arrived}});
window.addEventListener('magischeradar:surprise',()=>spawn(state.x,state.y,70,true));
window.addEventListener('magischeradar:wave',()=>spawn(state.x,state.y,30,false));
})();
