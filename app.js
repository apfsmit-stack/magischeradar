'use strict';
const KEY='magischeradar-v1';
const defaults={theme:'sint',distance:'buurt',date:'',message:'',postcode:'',pin:'2468'};
let settings={...defaults};
try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&typeof stored==='object')settings={...defaults,...stored}}catch{}
const $=id=>document.getElementById(id);
const themes={sint:{name:'Sinterklaas & Pieten',icon:'🎁',who:'De Pieten'},fee:{name:'Tandenfee',icon:'🧚',who:'De tandenfee'},paas:{name:'Paashaas',icon:'🐰',who:'De paashaas'},kabouter:{name:'Kabouters',icon:'🍄',who:'De kabouters'},kerst:{name:'Kerstman',icon:'🎅',who:'De kerstman'}};
const distances={ver:{label:'Nog ver weg',headline:'Er is iets magisch onderweg!',description:'De radar ziet een klein lichtpuntje in de verte.',position:[76,21]},buurt:{label:'In de buurt',headline:'Er gebeurt iets in de buurt!',description:'De magische signalen worden steeds sterker.',position:[66,33]},dichtbij:{label:'Heel dichtbij!',headline:'Wauw! Bijna hier!',description:'De radar ontvangt een heel sterk magisch signaal!',position:[55,43]}};
function render(){updateMap();const t=themes[settings.theme]||themes.sint;const d=distances[settings.distance]||distances.buurt;$('themeLabel').textContent=t.icon+' '+t.name;$('blip').textContent=t.icon;$('blip').style.left=d.position[0]+'%';$('blip').style.top=d.position[1]+'%';$('distance').textContent='● '+d.label;$('headline').textContent=d.headline;$('message').textContent=settings.message.trim()||`${t.who}: ${d.description}`;updateCountdown()}
function updateCountdown(){const el=$('countdown');if(!settings.date){el.textContent='✨ Een magisch avontuur wacht op je';return}const ms=new Date(settings.date).getTime()-Date.now();if(!Number.isFinite(ms)){el.textContent='';return}if(ms<=0){el.textContent='✨ Het magische moment is aangebroken!';return}const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000),seconds=Math.floor(ms%60000/1000);el.textContent=`⏳ ${days}d ${hours}u ${minutes}m ${seconds}s tot het magische moment`}
$('scan').addEventListener('click',()=>{const radar=$('radar');radar.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:1100});$('scan').textContent='✨ Signaal gevonden!';setTimeout(()=>$('scan').textContent='📡 Scan opnieuw',1500)});
$('openParent').addEventListener('click',()=>{$('pinInput').value='';$('authError').textContent='';$('authDialog').showModal()});
$('cancelAuth').addEventListener('click',()=>$('authDialog').close());
$('authForm').addEventListener('submit',e=>{e.preventDefault();if($('pinInput').value!==String(settings.pin)){$('authError').textContent='Deze code klopt niet.';return}$('authDialog').close();$('parentTheme').value=settings.theme;$('parentDistance').value=settings.distance;$('parentDate').value=settings.date;$('parentPostcode').value=settings.postcode||'';$('parentMessage').value=settings.message;$('parentPin').value='';$('parentDialog').showModal()});
$('closeParent').addEventListener('click',()=>$('parentDialog').close());
$('saveParent').addEventListener('click',()=>{const pin=$('parentPin').value.trim();if(pin&&(!/^\d{4,12}$/.test(pin))){alert('Gebruik 4 tot 12 cijfers voor de oudercode.');return}settings={...settings,theme:$('parentTheme').value,distance:$('parentDistance').value,date:$('parentDate').value,postcode:$('parentPostcode').value.replace(/\s/g,'').toUpperCase(),message:$('parentMessage').value.trim(),pin:pin||settings.pin};try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{alert('Opslaan op dit apparaat is niet gelukt. Controleer de browserinstellingen.')}render();$('parentDialog').close()});
render();setInterval(()=>{updateCountdown();updateMap()},1000);
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
function updateMap(){
 const point=postcodePoint(settings.postcode),dest=point||[790,525],start=[650,90];
 const end=settings.date?new Date(settings.date).getTime():NaN,now=Date.now(),duration=7*86400000;
 const progress=Number.isFinite(end)?Math.max(0,Math.min(1,(now-(end-duration))/duration)):.28;
 const ease=progress*progress*(3-2*progress);
 const x=start[0]+(dest[0]-start[0])*ease,y=start[1]+(dest[1]-start[1])*ease;
 const t=themes[settings.theme]||themes.sint;
 $('traveler').textContent=t.icon;
 $('traveler').setAttribute('x',x);$('traveler').setAttribute('y',y-15);
 $('homeMarker').setAttribute('x',dest[0]);$('homeMarker').setAttribute('y',dest[1]+20);
 $('homeHalo').setAttribute('cx',dest[0]);$('homeHalo').setAttribute('cy',dest[1]);
 $('homeRing').setAttribute('cx',dest[0]);$('homeRing').setAttribute('cy',dest[1]);
 const controlX=(start[0]+dest[0])/2-110,controlY=(start[1]+dest[1])/2-85;
 const trail=`M ${start[0]} ${start[1]} Q ${controlX} ${controlY} ${x} ${y}`;
 $('travelTrail').setAttribute('d',trail);$('travelTrailGlow').setAttribute('d',trail);
 $('mapNote').textContent=!point?'Vul in het ouderportaal een postcode in om de reis naar jouw regio te zien':!Number.isFinite(end)?'Stel een aankomsttijd in om de reis automatisch te laten verlopen':progress>=1?'✨ Het magische bezoek is aangekomen!':`✨ ${t.who} ${progress>.85?'is bijna in jouw buurt!':'is onderweg naar jouw regio!'}`;
}
