/* MagischeRadar 3.3: animated cel-shaded cartoon characters. Three.js via CDN; existing PNGs remain the offline fallback. */
(()=>{
'use strict';
const stage=document.querySelector('.map-stage'), svg=document.getElementById('nlMap'), traveler=document.getElementById('traveler');
if(!stage||!svg||!traveler||!window.THREE){console.info('3D unavailable: using existing 2D animations');return}
const T=window.THREE,canvas=document.createElement('canvas');canvas.id='character3d';canvas.setAttribute('role','button');canvas.setAttribute('tabindex','0');canvas.setAttribute('aria-label','Zwaai naar het magische figuurtje');stage.appendChild(canvas);
let renderer;try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){canvas.remove();return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,100);camera.position.set(0,2.2,11);camera.lookAt(0,.4,0);
scene.add(new T.HemisphereLight(0xffffff,0x7a8ac5,2.8));const sun=new T.DirectionalLight(0xffe8ba,2.1);sun.position.set(-4,8,9);scene.add(sun);const rim=new T.DirectionalLight(0x86d8ff,1.1);rim.position.set(5,2,-5);scene.add(rim);
const mat=(color,metalness=0)=>new T.MeshToonMaterial({color});
const M={red:mat(0xc62434),scarlet:mat(0xed3d3b),white:mat(0xfff6e6),skin:mat(0xffc79d),brown:mat(0x8b4b2d),dark:mat(0x292b42),gold:mat(0xffcb43,.55),green:mat(0x33884c),blue:mat(0x6683c5),pink:mat(0xf09ed9),purple:mat(0x9660db),fur:mat(0xf5e7d3),hoof:mat(0x564039),orange:mat(0xff9a37),silver:mat(0xd5e7ff,.3)};
const ball=(parent,r,m,x=0,y=0,z=0,scale)=>{const mesh=new T.Mesh(new T.SphereGeometry(r,16,12),m);mesh.position.set(x,y,z);if(scale)mesh.scale.set(...scale);parent.add(mesh);return mesh};
const box=(parent,w,h,d,m,x=0,y=0,z=0)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o};
const cone=(parent,r,h,m,x=0,y=0,z=0)=>{const o=new T.Mesh(new T.ConeGeometry(r,h,16),m);o.position.set(x,y,z);parent.add(o);return o};
const limb=(parent,m,x,y,z,len=.8,rad=.13)=>{const joint=new T.Group();joint.position.set(x,y,z);parent.add(joint);const o=new T.Mesh(new T.CapsuleGeometry(rad,Math.max(.04,len-2*rad),4,10),m);o.position.y=-len/2;joint.add(o);return joint};
const pivot=(p,x,y,z)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g};
function person(parent,kind='sint'){
 const torso=ball(parent,.47,kind==='fee'?M.purple:kind==='gnome'?M.green:M.red,0,1.35,0,[1,1.2,.75]);
 const head=ball(parent,.41,M.skin,0,2.05,.08);const eyes=[];for(const x of [-.16,.16]){ball(parent,.115,M.white,x,2.12,.43,[.9,1.12,.45]);const eye=ball(parent,.065,M.dark,x,2.11,.49,[.9,1.05,.55]);eyes.push(eye);ball(parent,.023,M.white,x-.018,2.15,.525)}ball(parent,.095,M.skin,0,1.99,.48);ball(parent,.085,M.pink,-.30,1.96,.31,[1.4,.55,.55]);ball(parent,.085,M.pink,.30,1.96,.31,[1.4,.55,.55]);const smile=ball(parent,.13,M.brown,0,1.87,.46,[1,.20,.25]);
 ball(parent,.08,M.skin,0,1.97,.42);const arms=[limb(parent,kind==='fee'?M.pink:M.red,-.47,1.66,0,.75,.13),limb(parent,kind==='fee'?M.pink:M.red,.47,1.66,0,.75,.13)];
 const legs=[limb(parent,M.dark,-.22,.95,0,.78,.15),limb(parent,M.dark,.22,.95,0,.78,.15)];
 if(kind==='sint'){cone(parent,.37,.8,M.red,0,2.68,0);ball(parent,.09,M.gold,0,3.03,0);box(parent,.55,.09,.48,M.gold,0,2.33,0);ball(parent,.26,M.white,0,1.82,.29,[1,1.3,.55]);}
 if(kind==='santa'){cone(parent,.42,.62,M.red,0,2.65,0);ball(parent,.14,M.white,0,3.02,0);ball(parent,.29,M.white,0,1.86,.3,[1,1.15,.6]);box(parent,.9,.11,.65,M.gold,0,1.25,.12)}
 return {arms,legs,torso,head,eyes,smile};
}
function horse(parent){const body=ball(parent,.9,M.white,0,1.25,0,[1.4,.65,.65]);const neck=ball(parent,.43,M.white,.87,1.8,0,[.65,1.3,.65]);const head=ball(parent,.42,M.white,1.14,2.3,0,[1.1,.65,.7]);ball(parent,.26,M.fur,1.47,2.14,.05,[1,.7,1]);const legs=[];for(let x of [-.72,.7])for(let z of [-.36,.36]){let j=limb(parent,M.white,x,1.04,z,1.15,.16);ball(j,.19,M.hoof,0,-1.05,0,[1.2,.5,1.2]);legs.push(j)}for(let i=0;i<5;i++)ball(parent,.18,M.fur,.63-i*.10,2.2+i*.14,-.08,[.55,1.6,.6]);ball(parent,.09,M.dark,1.32,2.41,.36);ball(parent,.055,M.white,1.30,2.44,.40);const tail=limb(parent,M.white,-1.17,1.45,0,.85,.13);tail.rotation.z=-.7;cone(parent,.22,.5,M.gold,.8,2.08,.05);return {legs,tail,head,body}}
function fairy(root){const p=person(root,'fee');p.legs.forEach(l=>l.rotation.z=.55);const wings=[];for(let sign of [-1,1]){const w=pivot(root,sign*.23,1.7,-.22);const m=new T.Mesh(new T.SphereGeometry(.65,16,12),new T.MeshPhysicalMaterial({color:0xd7b9ff,transparent:true,opacity:.68,roughness:.15,metalness:.2,side:T.DoubleSide}));m.scale.set(.18,1.25,.72);m.position.set(sign*.4,.25,-.2);w.add(m);wings.push(w)}cone(root,.52,.65,M.purple,0,.96,0);const wand=limb(p.arms[1],M.gold,0,-.67,.06,.75,.045);ball(wand,.19,M.gold,0,-.72,0);return {type:'fee',parts:p,wings,root}}
function rabbit(root){const body=ball(root,.75,M.fur,0,.85,0,[.83,1.15,.7]);const head=ball(root,.60,M.fur,0,1.84,.18);for(const x of [-.19,.19]){ball(root,.12,M.white,x,1.91,.65);ball(root,.08,M.dark,x,1.91,.73);ball(root,.025,M.white,x-.025,1.94,.79)}ball(root,.13,M.white,0,1.57,.68,[1.7,.6,.7]);ball(root,.13,M.pink,0,1.68,.7);const ears=[];for(const x of [-.28,.28]){const e=pivot(root,x,2.2,0);ball(e,.23,M.fur,0,.5,0,[.7,2.7,.5]);ball(e,.16,M.pink,0,.5,.1,[.7,2.5,.45]);ears.push(e)}ball(root,.23,M.white,-.53,.76,-.45);const feet=[limb(root,M.fur,-.38,.65,.15,.65,.23),limb(root,M.fur,.38,.65,.15,.65,.23)];const arms=[limb(root,M.fur,-.58,1.25,.3,.5,.16),limb(root,M.fur,.58,1.25,.3,.5,.16)];ball(root,.35,M.brown,.55,.88,.62,[1,.6,.7]);for(let i=0;i<5;i++)ball(root,.12,[M.pink,M.gold,M.blue][i%3],.32+(i%3)*.18,1.14,.65);return {type:'paas',ears,feet,arms,root}}
function gnome(root){const p=person(root,'gnome');cone(root,.52,1.5,M.red,0,2.77,0);ball(root,.31,M.white,0,1.83,.3,[1,1.2,.65]);ball(root,.19,M.skin,0,2.04,.48,[.8,1.2,.8]);const lantern=pivot(p.arms[1],0,-.73,0);box(lantern,.36,.5,.32,M.gold,0,-.25,0);ball(lantern,.18,new T.MeshBasicMaterial({color:0xfff4a5}),0,-.25,.2);return {type:'kabouter',parts:p,lantern,root}}
function sleigh(root){const sled=box(root,1.85,.5,.9,M.red,-.7,.85,0);box(root,.95,.7,.85,M.red,-1.2,1.25,0);for(let z of [-.45,.45]){const rail=box(root,2.5,.09,.11,M.gold,-.65,.4,z);rail.rotation.z=.05}const santa=pivot(root,-1.12,.72,0);santa.scale.setScalar(.58);const sp=person(santa,'santa');const deer=pivot(root,1.3,.55,0);deer.scale.setScalar(.63);const d=horse(deer);d.body.material=M.brown;d.head.material=M.brown;d.legs.forEach(l=>l.children[0].material=M.brown);for(let sign of [-1,1]){const antler=limb(deer,M.gold,1.1,2.7,sign*.23,.6,.055);antler.rotation.z=sign*.2}return {type:'kerst',parts:sp,deer:d,root}}
function sint(root){const h=horse(root);const rider=pivot(root,-.2,1.05,0);rider.scale.setScalar(.55);const p=person(rider,'sint');return {type:'sint',horse:h,parts:p,root}}
let active,theme='';function changeTheme(name){scene.clear();scene.add(new T.HemisphereLight(0xffffff,0x7a8ac5,2.8));scene.add(sun);scene.add(rim);const root=new T.Group();scene.add(root);active=({sint,fee,paas:rabbit,kabouter:gnome,kerst:sleigh}[name]||sint)(root);theme=name;root.rotation.y=-.24;}
const mode=window.matchMedia('(prefers-reduced-motion: reduce)');let last=0,phase=0;
function animate(now){requestAnimationFrame(animate);if(document.hidden)return;const current=(typeof settings!=='undefined'&&settings.theme)||'sint';if(current!==theme)changeTheme(current);
 const stageRect=stage.getBoundingClientRect(),r=traveler.getBoundingClientRect();if(!stageRect.width||!r.width)return;
 const size=Math.min(Math.max(stageRect.width*.21,125),260);const left=Math.max(0,Math.min(stageRect.width-size,r.left-stageRect.left+r.width/2-size/2));const top=Math.max(0,Math.min(stageRect.height-size,r.top-stageRect.top+r.height*.48-size*.58));
 canvas.style.left=left+'px';canvas.style.top=top+'px';canvas.style.width=size+'px';canvas.style.height=size+'px';const d=Math.round(size*(Math.min(devicePixelRatio||1,2)));if(canvas.width!==d){renderer.setSize(size,size,false);camera.aspect=1;camera.updateProjectionMatrix()}
 if(now-last>100){last=now}phase=now*.0035;const a=active;if(!a)return;
 const motion=mode.matches?.10:1;const wave=Math.sin(phase*2.5)*motion,hop=Math.max(0,Math.sin(phase*2))*motion;
 a.root.position.y=(theme==='fee'?.2:0)+Math.sin(phase*1.5)*.1*motion+(theme==='paas'?hop*.35:0);a.root.rotation.z=Math.sin(phase)*.045*motion;
 if(a.horse){a.horse.legs.forEach((l,i)=>l.rotation.z=Math.sin(phase*3+(i%3)*Math.PI)*.55*motion);a.horse.tail.rotation.z=-.7+wave*.2}
 if(a.deer)a.deer.legs.forEach((l,i)=>l.rotation.z=Math.sin(phase*3+i*Math.PI/2)*.6*motion);
 if(a.parts?.eyes){const blink=Math.sin(phase*.65)>0.985?.12:1;a.parts.eyes.forEach(e=>e.scale.y=blink)}
 if(a.parts){a.parts.arms.forEach((l,i)=>l.rotation.z=(i?-.35:.35)+Math.sin(phase*2+i*2)*.35*motion);a.parts.legs.forEach((l,i)=>l.rotation.z=Math.sin(phase*2+i*Math.PI)*.25*motion)}
 if(a.wings)a.wings.forEach((w,i)=>w.rotation.y=Math.sin(phase*7+i*Math.PI)*.65*motion);
 if(a.ears)a.ears.forEach((e,i)=>e.rotation.z=Math.sin(phase*2+i)*.12*motion);
 if(a.feet)a.feet.forEach((l,i)=>l.rotation.z=Math.sin(phase*2+i*Math.PI)*.6*motion);
 if(a.lantern)a.lantern.rotation.z=Math.sin(phase*2)*.3*motion;
 const dist=theme==='kerst'?15:theme==='sint'?12.5:10;camera.position.z=dist;camera.position.y=theme==='kerst'?2.1:2.4;camera.lookAt(0,theme==='fee'?1.5:1.25,0);
 renderer.render(scene,camera);
}
canvas.addEventListener('click',()=>{if(typeof characterReaction==='function')characterReaction('wave');if(active){active.root.rotation.y+=.38;active.root.scale.setScalar(1.10);setTimeout(()=>{if(active)active.root.scale.setScalar(1)},350)}});canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();canvas.click()}});
try{changeTheme((typeof settings!=='undefined'&&settings.theme)||'sint');document.body.classList.add('characters3d-on');requestAnimationFrame(animate)}catch(e){document.body.classList.remove('characters3d-on');canvas.remove();console.warn('3D fallback',e)}
})();
