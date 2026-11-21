'use strict';
const KEY='magischeradar-v1';
const defaults={theme:'sint',distance:'buurt',date:'',message:'',postcode:'',city:'',pin:'2468',mapPoint:null,geoPostcode:'',manualPoint:false,magic:'spannend'};
let settings={...defaults};
try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&typeof stored==='object')settings={...defaults,...stored}}catch{}
const $=id=>document.getElementById(id);
// Herbereken automatisch bepaalde locaties uit oudere versies. Handmatige keuzes blijven staan.
if(!settings.manualPoint && settings.locationCalibration!=='2.3'){
 settings.mapPoint=null;settings.geoPostcode='';settings.locationCalibration='2.3';
 try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{}
}
let previewStart=0,previewActive=false,previewFrame=0;
function stopPreview(){previewActive=false;cancelAnimationFrame(previewFrame);$('previewStrip').hidden=true;$('startPreview').disabled=false;updateMap()}
function runPreview(now){if(!previewActive)return;const elapsed=Math.max(0,now-previewStart);const linear=Math.min(1,elapsed/30000);const progress=previewJourneyProgress(linear);updateMap(progress);$('previewPercent').textContent=Math.round(linear*100)+'%';if(linear>=1){previewActive=false;$('startPreview').disabled=false;setTimeout(()=>{$('previewStrip').hidden=true;updateMap()},2200)}else previewFrame=requestAnimationFrame(runPreview)}
$('startPreview').addEventListener('click',()=>{$('parentDialog').close();previewActive=true;previewStart=performance.now();$('previewStrip').hidden=false;$('startPreview').disabled=true;previewFrame=requestAnimationFrame(runPreview)});
$('stopPreview').addEventListener('click',stopPreview);
const themes={sint:{name:'Sinterklaas & Pieten',icon:'🐎',who:'De Pieten',plural:true,travel:'Sinterklaas rijdt op Ozosnel'},fee:{name:'Tandenfee',icon:'🧚',who:'de tandenfee',plural:false},paas:{name:'Paashaas',icon:'🐰',who:'de paashaas',plural:false},kabouter:{name:'Kabouters',icon:'🍄',who:'de kabouters',plural:true},kerst:{name:'Kerstman',icon:'🎅',who:'de kerstman',plural:false}};
// Verhaalgebeurtenissen zijn fictief, niet gebaseerd op live locatiegegevens.
const adventures={
 sint:{icon:'🐎',rest:'Ozosnel neemt even een slokje water.',travel:'Sinterklaas en de Pieten rijden verder. Hoor je de hoefjes?',arrival:'Sinterklaas en de Pieten zijn aangekomen!'},
 fee:{icon:'🧚',rest:'De tandenfee strooit een beetje sterrenstof.',travel:'De tandenfee fladdert over de daken!',arrival:'De tandenfee is aangekomen!'},
 paas:{icon:'🐰',rest:'De paashaas verstopt onderweg een glinsterend ei.',travel:'Hop, hop! De paashaas springt verder.',arrival:'De paashaas is aangekomen!'},
 kabouter:{icon:'🍄',rest:'De kabouters rusten even onder een paddenstoel.',travel:'De kabouters wandelen vrolijk verder.',arrival:'De kabouters zijn aangekomen!'},
 kerst:{icon:'🦌',rest:'De rendieren krijgen even een worteltje.',travel:'De kerstman vliegt met zijn rendieren verder!',arrival:'De kerstman is aangekomen!'}
};
function previewJourneyProgress(t){
 // Korte pauze bij elke halte: het figuur blijft even staan voor een verrassing.
 const stages=5,stage=Math.min(stages-1,Math.floor(t*stages)),part=t*stages-stage;
 const held=part<.13?0:(part>.91?1:(part-.13)/.78);
 return (stage+held)/stages;
}
let previousCelebration='',lastBurst=0;
function setAdventureMode(){document.body.dataset.magic=settings.magic||'spannend'}
function updateStory(route,scaled,progress,preview){
 const a=adventures[settings.theme]||adventures.sint;
 const name=settings.city||'jouw woonplaats';
 const near=Math.round(scaled),atStop=near>0&&near<route.length-1&&Math.abs(scaled-near)<.065;
 const arrived=progress>=.999;
 const city=atStop?route[near].name:'';
 const key=arrived?'arrival':atStop?'stop-'+city:'travel-'+Math.floor(scaled);
 const title=arrived?'Hoera! We zijn er!':atStop?'Magische tussenstop in '+city+'!':progress>.86?'Bijna bij '+name+'!':'Er gebeurt iets magisch onderweg!';
 const description=arrived?a.arrival:atStop?a.rest:progress>.86?'Kijk goed, de bestemming is al bijna in zicht!':a.travel;
 $('storyIcon').textContent=a.icon;$('storyTitle').textContent=title;$('storyDescription').textContent=description;
 const active=settings.magic!=='rustig';
 $('storyCard').classList.toggle('celebrating',active&&(atStop||arrived));
 if(key!==previousCelebration){previousCelebration=key;if(active&&(atStop||arrived)&&performance.now()-lastBurst>1200){lastBurst=performance.now();burstMagic(arrived?20:11);}}
 if(!preview && !Number.isFinite(new Date(settings.date).getTime()))$('storyCard').classList.remove('celebrating');
}
function burstMagic(count){
 if(settings.magic==='rustig'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=$('arrivalBurst');target.replaceChildren();
 const total=settings.magic==='extra'?count:Math.ceil(count*.55);
 for(let i=0;i<total;i++){
  const star=document.createElement('span');star.className='burst-star';star.textContent=['✦','✧','★','✨'][i%4];
  star.style.setProperty('--angle',Math.round(i*360/total)+'deg');
  star.style.setProperty('--reach',(75+i%4*24)+'px');star.style.animationDelay=(i%5*.05)+'s';target.append(star);
 }
}
function moveCamera(x,y,progress){
 const cam=$('mapCamera');if(!cam)return;
 const mode=settings.magic||'spannend';
 if(mode==='rustig'||document.getElementById('nlMap').classList.contains('picking')||window.matchMedia('(prefers-reduced-motion: reduce)').matches){cam.style.transform='none';return;}
 // Zachte meebewegende camera, zonder de kaart uit beeld te duwen.
 const zoom=mode==='extra'?1.095:1.045;
 const tx=Math.max(-2.5,Math.min(2.5,(768-x)/1536*5));
 const ty=Math.max(-2,Math.min(2,(512-y)/1024*4));
 cam.style.transform=`translate(${tx}%,${ty}%) scale(${zoom})`;
}
const distances={ver:{label:'Nog ver weg',headline:'Er is iets magisch onderweg!',description:'De radar ziet een klein lichtpuntje in de verte.',position:[76,21]},buurt:{label:'In de buurt',headline:'Er gebeurt iets in de buurt!',description:'De magische signalen worden steeds sterker.',position:[66,33]},dichtbij:{label:'Heel dichtbij!',headline:'Wauw! Bijna hier!',description:'De radar ontvangt een heel sterk magisch signaal!',position:[55,43]}};
function sentenceWho(t){return t.who.charAt(0).toUpperCase()+t.who.slice(1)}
function verb(t,singular,plural){return t.plural?plural:singular}
function themeIcon(t){return t.icon}
function render(){setAdventureMode();updateMap();const t=themes[settings.theme]||themes.sint;const d=distances[settings.distance]||distances.buurt;document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b.dataset.theme===settings.theme);b.setAttribute('aria-current',b.dataset.theme===settings.theme?'true':'false')});$('blip').replaceChildren();const mini=document.createElement('img');mini.src='figuur-'+settings.theme+'.png';mini.alt='';$('blip').append(mini);$('blip').style.left=d.position[0]+'%';$('blip').style.top=d.position[1]+'%';$('distance').textContent='● '+d.label;$('headline').textContent=d.headline;$('message').textContent=settings.message.trim()||`${sentenceWho(t)}: ${d.description}`;updateCountdown()}
// Thema wisselen kan alleen via het ouderportaal.
function updateCountdown(){
 const el=$('countdown');
 if(!settings.date){el.textContent='✨ Stel een magisch moment in';return}
 const ms=new Date(settings.date).getTime()-Date.now();
 if(!Number.isFinite(ms)){el.textContent='';return}
 if(ms<=0){el.textContent='✨ Het magische moment is aangebroken!';return}
 const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000),seconds=Math.floor(ms%60000/1000);
 const parts=[['Dagen',days],['Uren',hours],['Minuten',minutes],['Seconden',seconds]];
 el.replaceChildren(...parts.map(([label,value])=>{const box=document.createElement('span');box.className='time-unit';const number=document.createElement('strong');number.textContent=String(value).padStart(2,'0');const caption=document.createElement('small');caption.textContent=label;box.append(number,caption);return box}));
}
$('scan').addEventListener('click',()=>{const radar=$('radar');radar.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:1100});$('scan').textContent='✨ Signaal gevonden!';setTimeout(()=>$('scan').textContent='📡 Zoek opnieuw naar signalen',1500)});
$('openParent').addEventListener('click',()=>{if(previewActive)stopPreview();$('pinInput').value='';$('authError').textContent='';$('authDialog').showModal()});
$('cancelAuth').addEventListener('click',()=>$('authDialog').close());
$('authForm').addEventListener('submit',e=>{e.preventDefault();if($('pinInput').value!==String(settings.pin)){$('authError').textContent='Deze code klopt niet.';return}$('authDialog').close();$('parentTheme').value=settings.theme;$('parentDistance').value=settings.distance;$('parentMagic').value=settings.magic||'spannend';$('parentDate').value=settings.date;$('parentPostcode').value=settings.postcode||'';$('parentCity').value=settings.city||'';$('parentMessage').value=settings.message;$('parentPin').value='';$('locationStatus').textContent='Klik op de knop om een punt op de kaart te kiezen.';$('parentDialog').showModal()});
$('closeParent').addEventListener('click',()=>$('parentDialog').close());
$('saveParent').addEventListener('click',async()=>{const pin=$('parentPin').value.trim();if(pin&&(!/^\d{4,12}$/.test(pin))){alert('Gebruik 4 tot 12 cijfers voor de oudercode.');return}settings={...settings,theme:$('parentTheme').value,distance:$('parentDistance').value,magic:$('parentMagic').value,date:$('parentDate').value,postcode:$('parentPostcode').value.replace(/\s/g,'').toUpperCase(),city:$('parentCity').value.trim().slice(0,55),message:$('parentMessage').value.trim(),pin:pin||settings.pin};if(settings.postcode.slice(0,4)!==settings.geoPostcode){settings.mapPoint=null;settings.geoPostcode='';settings.manualPoint=false};try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{alert('Opslaan op dit apparaat is niet gelukt. Controleer de browserinstellingen.')}render();$('parentDialog').close();await lookupPostcode();});

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
 if(n===16)return [735,298]; // Hoorn en West-Friesland, voorlopige regio
 if(n>=15&&n<=19)return [605,310]; // Noord-Holland
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
 const accurate=Array.isArray(settings.mapPoint)&&settings.mapPoint.length===2?settings.mapPoint:null;
 return {point:accurate||(named?routeCities[named]:(point||[790,525])),name:settings.city.trim(),hasPostcode:!!point||!!accurate};
}
function getRoute(destination){
 const [x,y]=destination;
 // Een reis van noord naar zuid, zonder onlogische omwegen of terugrijden.
 // Voor Noord-Holland gaat de reis via Friesland en Amsterdam alleen als dat logisch is.
 let names;
 if(y<360 && x<820) names=['Groningen','Leeuwarden'];
 else if(y<300) names=['Groningen','Leeuwarden'];
 else if(x<570) names=['Groningen','Leeuwarden','Amsterdam','Den Haag'];
 else if(x<790 && y<470) names=['Groningen','Leeuwarden','Amsterdam'];
 else if(x<900 && y<630) names=['Groningen','Zwolle','Utrecht'];
 else if(y>700) names=['Groningen','Zwolle','Utrecht','Eindhoven'];
 else if(x>970) names=['Groningen','Zwolle','Arnhem'];
 else names=['Groningen','Zwolle','Utrecht'];
 names=names.filter(n=>Math.hypot(routeCities[n][0]-x,routeCities[n][1]-y)>65);
 return [{name:'Vertrek',xy:[1270,95]},...names.map(name=>({name,xy:routeCities[name]})),{name:'Thuis',xy:destination}];
}
function interpolate(a,b,t){const smooth=t*t*(3-2*t);return [a[0]+(b[0]-a[0])*smooth,a[1]+(b[1]-a[1])*smooth]}
function updateMap(overrideProgress=null){
 const dest=getDestination(),route=getRoute(dest.point),end=settings.date?new Date(settings.date).getTime():NaN;
 $('destinationText').textContent=dest.name||'Jouw regio';
 $('arrivalText').textContent=Number.isFinite(end)?new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(end)):'Nog niet ingesteld';
 const duration=7*86400000,now=Date.now();
 const progress=overrideProgress!==null?overrideProgress:(Number.isFinite(end)?Math.max(0,Math.min(1,(now-(end-duration))/duration)):.28);
 $('progressBar').style.width=Math.round(progress*100)+'%';const n=route.length-1,scaled=progress*n,segment=Math.min(n-1,Math.floor(scaled)),part=Math.max(0,Math.min(1,scaled-segment));
 // Bepaal de positie op precies dezelfde gebogen SVG-curve als de zichtbare route.
 const [x,y]=pointOnCurve(route[segment].xy,route[segment+1].xy,part);
 const t=themes[settings.theme]||themes.sint;
 moveCamera(x,y,progress);updateStory(route,scaled,progress,overrideProgress!==null);
 $('travelerMotion').setAttribute('class','travel-motion motion-'+settings.theme+(progress>=1?' motion-arrived':''));$('traveler').setAttribute('href','figuur-'+settings.theme+'.png');const tw=settings.theme==='kerst'?185:settings.theme==='sint'?153:123;const th=tw*.95;$('traveler').setAttribute('width',tw);$('traveler').setAttribute('height',th);$('traveler').setAttribute('x',x-tw/2);$('traveler').setAttribute('y',y-th*.82);$('heroFigure').src='figuur-'+settings.theme+'.png';$('heroFigure').alt=t.name;
 const [dx,dy]=dest.point;
 $('homeMarker').setAttribute('x',dx);$('homeMarker').setAttribute('y',dy+20);
 $('homeHalo').setAttribute('cx',dx);$('homeHalo').setAttribute('cy',dy);
 $('homeRing').setAttribute('cx',dx);$('homeRing').setAttribute('cy',dy);
 // Route langs alle reeds bezochte tussenstops, met een gedeeltelijke laatste etappe.
 const visited=route.slice(0,segment+1).map(r=>r.xy);
 const trail=routePath(visited)+(part>0?' '+partialCurve(route[segment].xy,route[segment+1].xy,part):'');
 const starPoints=visited.concat([[x,y]]);
 $('travelTrail').setAttribute('d',trail);$('travelTrailGlow').setAttribute('d',trail);const future=routePath(route.map(r=>r.xy));$('futureTrail').setAttribute('d',future);drawStops(route,progress*n);drawTravelStars(starPoints);
 const stop=progress>=1?'Thuis':route[segment].name;
 const next=route[segment+1].name;
 const note=$('mapNote'),event=$('cityEvent');
 const homeName=dest.name||'jouw regio';$('nextStop').textContent=progress>=1?'🎉 Aangekomen in '+homeName:('✨ Volgende halte: '+(next==='Thuis'?homeName:next));if(settings.magic!=='rustig')drawCityCelebration(route,scaled,progress);else $('cityCelebration').replaceChildren();$('bannerText').textContent=Number.isFinite(end)?`${sentenceWho(t)} ${verb(t,'komt','komen')} steeds dichter bij ${homeName}!`:'Een magische reis door Nederland wacht op je!';
 $('homeCity').textContent=dest.name|| (dest.hasPostcode?'Jouw regio':'Bestemming');
 // Houd de woonplaatsnaam weg van bestaande stadslabels (vooral Amsterdam).
 const labelX=(dy<380&&dx>=550&&dx<850)?dx+80:(dx>1120?dx-105:dx<350?dx+105:dx+90);
 const labelY=(dy<380&&dx>=550&&dx<850)?dy-52:(dy<280?dy+100:dy>790?dy-82:dy+94);
 $('homeCity').setAttribute('x',Math.max(105,Math.min(1420,labelX)));
 $('homeCity').setAttribute('y',labelY);
 $('homeCity').setAttribute('font-size',dest.name.length>16?'26':'34');$('travelMeterText').textContent=(previewActive||overrideProgress!==null)?('Voorbeeldreis: '+Math.round(progress*100)+'% afgelegd') :Number.isFinite(end)?(progress>=1?'De magische reis is voltooid!':Math.round(progress*100)+'% van de reis afgelegd'):'De magische reis begint zodra de aankomsttijd is ingesteld';
 if(previewActive||overrideProgress!==null){note.textContent='▶ Voorbeeldweergave: de echte reis loopt gewoon door';event.textContent=progress>=1?'🎉 Voorbeeld: aangekomen in '+homeName+'!':`${themeIcon(t)} ${sentenceWho(t)} ${verb(t,'reist','reizen')} via ${stop==='Vertrek'?'Groningen':stop} naar ${next==='Thuis'?homeName:next}!`;
 }else if(!dest.hasPostcode&&!dest.name){
   note.textContent='Vul een postcode en woonplaats in bij het ouderportaal.';
   event.textContent='✨ Een magische reis door Nederland wacht op je!';
 }else if(!Number.isFinite(end)){
   note.textContent='Stel een aankomstdatum en tijd in om de reis te starten.';
   event.textContent=`🏡 De bestemming is ${homeName}.`;
 }else if(progress>=1){
   note.textContent=`✨ ${sentenceWho(t)} ${verb(t,'is','zijn')} aangekomen in ${homeName}!`;
   event.textContent='🎉 Het magische moment is aangebroken!';
 }else{
   const visitedCity=stop==='Vertrek'?'Groningen':stop;
   note.textContent=`📍 ${sentenceWho(t)} ${verb(t,'reist','reizen')} richting ${homeName}`;
   event.textContent=progress<.03?`✨ ${t.who} begint aan de reis!`:
    `${themeIcon(t)} ${sentenceWho(t)} ${part<.22?(verb(t,'is','zijn')+' gesignaleerd in '+visitedCity):(verb(t,'reist','reizen')+' van '+visitedCity+' naar '+(next==='Thuis'?homeName:next))}!`;
 }
 const stops=$('routeStops');stops.replaceChildren();
 for(let i=1;i<route.length-1;i++){
   const item=document.createElement('span');item.className='route-stop'+(progress*n>=i?' passed':'');
   item.textContent=(progress*n>=i?'✓ ':'○ ')+route[i].name;stops.append(item);
 }
}


// Map coordinates are illustration coordinates, calibrated against major Dutch cities.
// Public PDOK search receives ONLY the first four digits, never the full postcode.
// Handmatig gekalibreerde ijkpunten op de geïllustreerde kaart.
// De illustratie is artistiek vervormd; driehoeksinterpolatie volgt lokale verhoudingen
// beter dan één gemiddelde over heel Nederland.
const geoAnchors=[
 // lengtegraad, breedtegraad, kaart-x, kaart-y
 [4.9041,52.3676,650,388], // Amsterdam
 [4.3007,52.0705,435,505], // Den Haag
 [4.4777,51.9244,570,620], // Rotterdam
 [5.1214,52.0907,770,518], // Utrecht
 [5.9111,51.9851,1030,562], // Arnhem
 [6.5665,53.2194,1230,146], // Groningen
 [5.7999,53.2012,970,204], // Leeuwarden
 [6.0944,52.5168,1055,332], // Zwolle
 [5.4797,51.4416,805,756], // Eindhoven
 [5.6900,50.8514,980,874], // Maastricht
 [4.6462,52.3874,560,405], // Haarlem
 [5.3878,52.1561,855,425], // Amersfoort
 [4.7545,52.9599,620,260], // Den Helder
 [6.8937,52.2215,1190,375], // Enschede
 [6.5627,52.9946,1120,240], // Assen
 [5.059,52.643,735,298], // Hoorn: boven en rechts van Amsterdam, aan Markermeer
 [5.291,52.456,820,355], // Lelystad
 [5.221,52.355,785,420], // Almere
 [4.752,52.632,605,310], // Alkmaar
 [5.471,52.698,845,283], // Enkhuizen
 [4.892,52.958,755,210], // Texel
 [5.063,51.558,700,705], // Tilburg
 [5.303,51.690,770,663], // Den Bosch
 [5.852,51.842,1020,650], // Nijmegen
 [6.163,52.252,1085,440], // Deventer
 [5.969,52.211,1060,470], // Apeldoorn
 [4.664,51.813,635,670], // Dordrecht
 [3.611,51.498,240,735], // Middelburg
 [5.115,52.224,745,465], // Hilversum
 [6.570,53.000,1140,235] // Noord-Nederland
];
// Driehoeken worden vooraf bepaald uit de geografische ijkpunten. Geen extra library nodig.
const geoTriangles=[[23,9,13],[23,8,9],[1,12,27],[21,3,26],[8,21,9],[9,21,27],[21,26,27],[22,8,23],[22,21,8],[21,22,3],[6,14,5],[5,29,13],[29,14,13],[14,29,5],[3,0,26],[28,0,3],[20,6,12],[6,7,14],[14,7,13],[18,0,15],[20,18,15],[18,20,12],[0,10,26],[18,10,0],[10,12,1],[10,18,12],[7,24,13],[11,28,3],[11,22,23],[22,11,3],[19,7,6],[19,20,15],[20,19,6],[10,2,26],[2,10,1],[26,2,27],[2,1,27],[25,24,7],[19,25,7],[25,19,11],[19,16,11],[16,19,15],[25,4,24],[4,23,13],[24,4,13],[4,11,23],[4,25,11],[11,17,28],[16,17,11],[17,0,28],[0,17,15],[17,16,15]];
function triangleWeights(lon,lat,a,b,c){
 const det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
 if(Math.abs(det)<1e-10)return null;
 const u=((b[1]-c[1])*(lon-c[0])+(c[0]-b[0])*(lat-c[1]))/det;
 const v=((c[1]-a[1])*(lon-c[0])+(a[0]-c[0])*(lat-c[1]))/det;
 return [u,v,1-u-v];
}
function lonLatToMap(lon,lat){
 for(const [a,b,c] of geoTriangles){
  const w=triangleWeights(lon,lat,geoAnchors[a],geoAnchors[b],geoAnchors[c]);
  if(w&&Math.min(...w)>=-0.00001){
   const x=w[0]*geoAnchors[a][2]+w[1]*geoAnchors[b][2]+w[2]*geoAnchors[c][2];
   const y=w[0]*geoAnchors[a][3]+w[1]*geoAnchors[b][3]+w[2]*geoAnchors[c][3];
   return [Math.round(x),Math.round(y)];
  }
 }
 // Buiten de driehoeken: gebruik het dichtstbijzijnde ijkpunt als veilige benadering.
 const closest=[...geoAnchors].sort((a,b)=>Math.hypot((lon-a[0])*.65,lat-a[1])-Math.hypot((lon-b[0])*.65,lat-b[1]))[0];
 return [closest[2],closest[3]];
}
async function lookupPostcode(){
 const pc=settings.postcode.slice(0,4);
 if(!/^\d{4}$/.test(pc)||settings.manualPoint)return;
 try{
  const url='https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q='+encodeURIComponent('postcode:'+pc)+'&rows=10';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6500);
  let response;try{response=await fetch(url,{signal:controller.signal})}finally{clearTimeout(timeout)}
  if(!response.ok)throw Error('PDOK niet bereikbaar');
  const data=await response.json();const docs=data.response?.docs||[];
  const result=docs.find(d=>String(d.postcode||'').replace(/\s/g,'').startsWith(pc)&&d.centroide_ll);
  if(!result)throw Error('Postcode niet gevonden');
  const match=String(result.centroide_ll).match(/POINT\s*\(([\d.-]+)\s+([\d.-]+)\)/i);
  if(!match)throw Error('Geen kaartcoördinaten');
  const lon=Number(match[1]),lat=Number(match[2]);
  if(lon<3||lon>8||lat<50||lat>54)throw Error('Ongeldige kaartcoördinaten');
  if(settings.postcode.slice(0,4)!==pc || settings.manualPoint)return;settings.mapPoint=lonLatToMap(lon,lat);settings.geoPostcode=pc;settings.locationCalibration='2.3';
  if(!settings.city.trim()&&result.woonplaatsnaam)settings.city=String(result.woonplaatsnaam).slice(0,55);
  localStorage.setItem(KEY,JSON.stringify(settings));render();$('locationStatus').textContent='✓ Postcodegebied '+pc+' gevonden. Controleer de plek op de kaart.';
 }catch(err){$('locationStatus').textContent='Postcode niet automatisch gevonden. Wijs de woonplaats eventueel zelf aan op de kaart.';console.info('Postcodezoekfunctie niet beschikbaar; gebruik de kaartkeuze.',err.message)}
}
let picking=false;
$('pickLocation').addEventListener('click',()=>{
 picking=true;$('mapCamera').style.transform='none';$('locationStatus').textContent='Klik nu op jouw woonplaats op de grote kaart. Het ouderportaal sluit tijdelijk.';
 $('parentDialog').close();$('nlMap').classList.add('picking');
});
$('nlMap').addEventListener('click',e=>{
 if(!picking)return;
 const svg=$('nlMap');const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const local=point.matrixTransform(ctm.inverse());const x=Math.max(0,Math.min(1536,local.x)),y=Math.max(0,Math.min(1024,local.y));
 settings.mapPoint=[Math.round(x),Math.round(y)];settings.geoPostcode=settings.postcode.slice(0,4);settings.manualPoint=true;settings.locationCalibration='2.3';
 picking=false;$('nlMap').classList.remove('picking');
 settings.city=$('parentCity').value.trim()||settings.city;
 localStorage.setItem(KEY,JSON.stringify(settings));render();
 $('locationStatus').textContent='✓ De bestemming is handmatig op de kaart gezet.';
 $('parentDialog').showModal();
});
function curveControl(a,b){const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const bend=Math.min(38,Math.hypot(b[0]-a[0],b[1]-a[1])*.12);return [mx,my-bend]}
function pointOnCurve(a,b,t){const c=curveControl(a,b),u=1-t;return [u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]}
function partialCurve(a,b,t){const c=curveControl(a,b),d=[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t],e=[c[0]+(b[0]-c[0])*t,c[1]+(b[1]-c[1])*t],f=[d[0]+(e[0]-d[0])*t,d[1]+(e[1]-d[1])*t];return `Q ${d[0]} ${d[1]} ${f[0]} ${f[1]}`}
function routePath(points){
 if(!points.length)return '';
 if(points.length===1)return `M ${points[0][0]} ${points[0][1]}`;
 let d=`M ${points[0][0]} ${points[0][1]}`;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],c=curveControl(a,b);
  d+=` Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
 }
 return d;
}
function drawTravelStars(points){
 const g=$('travelStars');g.replaceChildren();if(points.length<2)return;
 const ns='http://www.w3.org/2000/svg';
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const count=Math.max(1,Math.floor(len/38));
  for(let j=1;j<=count;j++){
   const t=j/(count+1),[x,y]=pointOnCurve(a,b,t);
   const star=document.createElementNS(ns,'circle');star.setAttribute('cx',x);star.setAttribute('cy',y);star.setAttribute('r',j%3===0?'6':'3.5');star.setAttribute('fill',j%3===0?'#fffef0':'#ffe17a');star.setAttribute('class','travel-star');star.style.animationDelay=(j*.17+i*.31)+'s';g.append(star);
  }
 }
}
function drawCityCelebration(route,scaled,progress){
 const g=$('cityCelebration');g.replaceChildren();
 if(progress>=1)return;
 const nearest=Math.round(scaled);
 if(nearest<1||nearest>=route.length-1||Math.abs(scaled-nearest)>.085)return;
 const [x,y]=route[nearest].xy;
 const ns='http://www.w3.org/2000/svg';
 for(let i=0;i<10;i++){
  const spark=document.createElementNS(ns,'text');
  const angle=i*Math.PI*2/10;
  spark.setAttribute('x',x+Math.cos(angle)*44);
  spark.setAttribute('y',y+Math.sin(angle)*44);
  spark.setAttribute('text-anchor','middle');
  spark.setAttribute('font-size',i%2?'24':'33');
  spark.setAttribute('fill',i%2?'#fff4c4':'#ffdc67');
  spark.setAttribute('class','city-spark');
  spark.style.animationDelay=(i*.12)+'s';spark.textContent=i%3===0?'✦':'✧';g.append(spark);
 }
}
function drawStops(route,visited){
 const g=$('stopMarkers');g.replaceChildren();
 route.slice(1,-1).forEach((stop,i)=>{
  const ns='http://www.w3.org/2000/svg';
  const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',stop.xy[0]);circle.setAttribute('cy',stop.xy[1]);circle.setAttribute('r',i+1<=visited?'13':'9');circle.setAttribute('fill',i+1<=visited?'#ffe77b':'#f8fbff');circle.setAttribute('stroke','#173d7d');circle.setAttribute('stroke-width','4');
  g.append(circle);if(i+1<=visited){const sparkle=document.createElementNS(ns,'text');sparkle.setAttribute('x',stop.xy[0]+17);sparkle.setAttribute('y',stop.xy[1]-14);sparkle.setAttribute('font-size','27');sparkle.textContent='✦';sparkle.setAttribute('fill','#fff2a1');g.append(sparkle)}
 });
}

render();lookupPostcode();setInterval(()=>{updateCountdown();if(!previewActive)updateMap()},1000);
