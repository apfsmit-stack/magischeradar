'use strict';
const KEY='magischeradar-v1';
const defaults={theme:'sint',distance:'buurt',date:'',message:'',postcode:'',city:'',pin:'2468'};
let settings={...defaults};
try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&typeof stored==='object')settings={...defaults,...stored}}catch{}
const $=id=>document.getElementById(id);
const themes={sint:{name:'Sinterklaas & Pieten',icon:'🎁',who:'De Pieten'},fee:{name:'Tandenfee',icon:'🧚',who:'De tandenfee'},paas:{name:'Paashaas',icon:'🐰',who:'De paashaas'},kabouter:{name:'Kabouters',icon:'🍄',who:'De kabouters'},kerst:{name:'Kerstman',icon:'🎅',who:'De kerstman'}};
const distances={ver:{label:'Nog ver weg',headline:'Er is iets magisch onderweg!',description:'De radar ziet een klein lichtpuntje in de verte.',position:[76,21]},buurt:{label:'In de buurt',headline:'Er gebeurt iets in de buurt!',description:'De magische signalen worden steeds sterker.',position:[66,33]},dichtbij:{label:'Heel dichtbij!',headline:'Wauw! Bijna hier!',description:'De radar ontvangt een heel sterk magisch signaal!',position:[55,43]}};
function render(){updateMap();const t=themes[settings.theme]||themes.sint;const d=distances[settings.distance]||distances.buurt;document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b.dataset.theme===settings.theme);b.setAttribute('aria-pressed',String(b.dataset.theme===settings.theme))});$('blip').textContent=t.icon;$('blip').style.left=d.position[0]+'%';$('blip').style.top=d.position[1]+'%';$('distance').textContent='● '+d.label;$('headline').textContent=d.headline;$('message').textContent=settings.message.trim()||`${t.who}: ${d.description}`;updateCountdown()}
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{settings.theme=button.dataset.theme;try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{}render()}));
function updateCountdown(){const el=$('countdown');if(!settings.date){el.textContent='✨ Een magisch avontuur wacht op je';return}const ms=new Date(settings.date).getTime()-Date.now();if(!Number.isFinite(ms)){el.textContent='';return}if(ms<=0){el.textContent='✨ Het magische moment is aangebroken!';return}const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000),seconds=Math.floor(ms%60000/1000);el.textContent=`${days} dagen · ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`}
$('scan').addEventListener('click',()=>{const radar=$('radar');radar.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:1100});$('scan').textContent='✨ Signaal gevonden!';setTimeout(()=>$('scan').textContent='📡 Scan opnieuw',1500)});
$('openParent').addEventListener('click',()=>{$('pinInput').value='';$('authError').textContent='';$('authDialog').showModal()});
$('cancelAuth').addEventListener('click',()=>$('authDialog').close());
$('authForm').addEventListener('submit',e=>{e.preventDefault();if($('pinInput').value!==String(settings.pin)){$('authError').textContent='Deze code klopt niet.';return}$('authDialog').close();$('parentTheme').value=settings.theme;$('parentDistance').value=settings.distance;$('parentDate').value=settings.date;$('parentPostcode').value=settings.postcode||'';$('parentCity').value=settings.city||'';$('parentMessage').value=settings.message;$('parentPin').value='';$('parentDialog').showModal()});
$('closeParent').addEventListener('click',()=>$('parentDialog').close());
$('saveParent').addEventListener('click',()=>{const pin=$('parentPin').value.trim();if(pin&&(!/^\d{4,12}$/.test(pin))){alert('Gebruik 4 tot 12 cijfers voor de oudercode.');return}settings={...settings,theme:$('parentTheme').value,distance:$('parentDistance').value,date:$('parentDate').value,postcode:$('parentPostcode').value.replace(/\s/g,'').toUpperCase(),city:$('parentCity').value.trim().slice(0,55),message:$('parentMessage').value.trim(),pin:pin||settings.pin};try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{alert('Opslaan op dit apparaat is niet gelukt. Controleer de browserinstellingen.')}render();$('parentDialog').close()});

if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// Privacyvriendelijke fantasiekaart: globale positie op basis van uitsluitend de eerste twee postcodecijfers.
// Geen geocoding, geen netwerkverzoek, geen huisadres.
// Posities op de geïllustreerde kaart (pixels op het originele canvas van 1536 x 1024).
// De eerste twee postcodecijfers geven alleen een ruwe regio, geen exacte locatie.
function postcodePoint(code){
 const m=String(code||'').replace(/\s/g,'').match(/^(\d{2})\d{2}(?:[A-Z]{2})?$/);
 if(!m)return null;
 const n=Number(m[1]);
 if(n>=10&&n<=12)return [605,392]; // Amsterdam
 if(n>=13&&n<=14)return [790,412]; // Flevoland
 if(n>=15&&n<=19)return [540,340]; // Noord-Holland
 if(n>=20&&n<=21)return [490,415]; // Haarlem
 if(n>=22&&n<=25)return [430,515]; // Den Haag
 if(n>=26&&n<=29)return [530,570]; // Zuid-Holland
 if(n>=30&&n<=33)return [575,630]; // Rotterdam
 if(n>=34&&n<=39)return [785,525]; // Utrecht
 if(n>=40&&n<=42)return [855,650]; // Rivierengebied
 if(n>=43&&n<=46)return [250,745]; // Zeeland
 if(n>=47&&n<=49)return [490,730]; // West-Brabant
 if(n>=50&&n<=52)return [750,735]; // Midden-Brabant
 if(n>=53&&n<=59)return [930,780]; // Oost-Brabant / Noord-Limburg
 if(n>=60&&n<=64)return [1000,880]; // Limburg
 if(n>=65&&n<=69)return [1050,570]; // Arnhem/Nijmegen
 if(n>=70&&n<=73)return [1120,520]; // Achterhoek
 if(n>=74&&n<=77)return [1090,380]; // Twente
 if(n>=78&&n<=79)return [1120,290]; // Drenthe
 if(n>=80&&n<=82)return [1030,325]; // Zwolle
 if(n>=83&&n<=84)return [825,290]; // Friesland/Flevoland
 if(n>=85&&n<=89)return [815,190]; // Friesland
 if(n>=90&&n<=92)return [890,165]; // Noord-Friesland
 if(n>=93&&n<=99)return [1210,140]; // Groningen
 return null;
}
// Reissteden en posities zijn afgestemd op de geïllustreerde kaart van 1536 x 1024.
// De reis is fictief en gebruikt geen locatiegegevens van het apparaat.
const routeCities={
 Groningen:[1230,146],Leeuwarden:[970,204],Zwolle:[1055,332],
 Amsterdam:[650,388],Utrecht:[770,518],Arnhem:[1030,562],
 Rotterdam:[570,620],'Den Haag':[435,505],Eindhoven:[805,756],Maastricht:[980,874]
};
const cityAliases={'s-gravenhage':'Den Haag','den haag':'Den Haag','the hague':'Den Haag'};
function cityKey(name){const key=String(name||'').trim().toLowerCase();return cityAliases[key]||Object.keys(routeCities).find(n=>n.toLowerCase()===key)||null}
function getDestination(){
 const point=postcodePoint(settings.postcode);
 const named=cityKey(settings.city);
 // Handmatig gekozen woonplaats mag de globale postcodepositie verfijnen.
 return {point:named?routeCities[named]:(point||[790,525]),name:settings.city.trim(),hasPostcode:!!point};
}
function getRoute(destination){
 const [x,y]=destination;
 // Een logische fantasieroute langs herkenbare steden, passend bij de regio.
 let names;
 if(y<290)names=['Groningen','Leeuwarden'];
 else if(x<570)names=['Groningen','Zwolle','Amsterdam','Den Haag'];
 else if(x<770)names=['Groningen','Zwolle','Amsterdam','Utrecht'];
 else if(y>700)names=['Groningen','Zwolle','Utrecht','Eindhoven'];
 else if(x>970)names=['Groningen','Zwolle','Arnhem'];
 else names=['Groningen','Zwolle','Utrecht'];
 // De laatste halte ligt altijd bij de woonplaats. Voorkom dubbele eindhaltes.
 names=names.filter(n=>Math.hypot(routeCities[n][0]-x,routeCities[n][1]-y)>45);
 return [{name:'Vertrek',xy:[1270,95]},...names.map(name=>({name,xy:routeCities[name]})),{name:'Thuis',xy:destination}];
}
function interpolate(a,b,t){const smooth=t*t*(3-2*t);return [a[0]+(b[0]-a[0])*smooth,a[1]+(b[1]-a[1])*smooth]}
function updateMap(){
 const dest=getDestination(),route=getRoute(dest.point),end=settings.date?new Date(settings.date).getTime():NaN;
 $('destinationText').textContent=dest.name||'Jouw regio';
 $('arrivalText').textContent=Number.isFinite(end)?new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(end)):'Nog niet ingesteld';
 const duration=7*86400000,now=Date.now();
 const progress=Number.isFinite(end)?Math.max(0,Math.min(1,(now-(end-duration))/duration)):.28;
 $('progressBar').style.width=Math.round(progress*100)+'%';const n=route.length-1,scaled=progress*n,segment=Math.min(n-1,Math.floor(scaled)),part=Math.max(0,Math.min(1,scaled-segment));
 const [x,y]=interpolate(route[segment].xy,route[segment+1].xy,part);
 const t=themes[settings.theme]||themes.sint;
 $('traveler').textContent=t.icon;$('traveler').setAttribute('x',x);$('traveler').setAttribute('y',y-17);
 const [dx,dy]=dest.point;
 $('homeMarker').setAttribute('x',dx);$('homeMarker').setAttribute('y',dy+20);
 $('homeHalo').setAttribute('cx',dx);$('homeHalo').setAttribute('cy',dy);
 $('homeRing').setAttribute('cx',dx);$('homeRing').setAttribute('cy',dy);
 // Route langs alle reeds bezochte tussenstops, met een gedeeltelijke laatste etappe.
 const visited=route.slice(0,segment+1).map(r=>r.xy);visited.push([x,y]);
 const trail=visited.map((p,i)=>(i?'L ':'M ')+p[0]+' '+p[1]).join(' ');
 $('travelTrail').setAttribute('d',trail);$('travelTrailGlow').setAttribute('d',trail);
 const stop=progress>=1?'Thuis':route[segment].name;
 const next=route[segment+1].name;
 const note=$('mapNote'),event=$('cityEvent');
 const homeName=dest.name||'jouw regio';$('bannerText').textContent=Number.isFinite(end)?`${t.who} komt steeds dichter bij ${homeName}!`:'Een magische reis door Nederland wacht op je!';
 $('homeCity').textContent=dest.name|| (dest.hasPostcode?'Jouw regio':'Bestemming');
 $('homeCity').setAttribute('x',Math.max(110,Math.min(1420,dx)));
 $('homeCity').setAttribute('y',dy+94);
 if(!dest.hasPostcode&&!dest.name){
   note.textContent='Vul een postcode en woonplaats in bij het ouderportaal.';
   event.textContent='✨ Een magische reis door Nederland wacht op je!';
 }else if(!Number.isFinite(end)){
   note.textContent='Stel een aankomstdatum en tijd in om de reis te starten.';
   event.textContent=`🏡 De bestemming is ${homeName}.`;
 }else if(progress>=1){
   note.textContent=`✨ ${t.who} is aangekomen in ${homeName}!`;
   event.textContent='🎉 Het magische moment is aangebroken!';
 }else{
   const visitedCity=stop==='Vertrek'?'Groningen':stop;
   note.textContent=`📍 ${t.who} reist richting ${homeName}`;
   event.textContent=progress<.03?`✨ ${t.who} begint aan de reis!`:
    `${t.icon} ${t.who} ${part<.22?'is gesignaleerd in '+visitedCity:'reist van '+visitedCity+' naar '+(next==='Thuis'?homeName:next)}!`;
 }
 const stops=$('routeStops');stops.replaceChildren();
 for(let i=1;i<route.length-1;i++){
   const item=document.createElement('span');item.className='route-stop'+(progress*n>=i?' passed':'');
   item.textContent=(progress*n>=i?'✓ ':'○ ')+route[i].name;stops.append(item);
 }
}

render();setInterval(()=>{updateCountdown();updateMap()},1000);
