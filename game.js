(() => {
'use strict';
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
const ui={level:document.getElementById('level'),score:document.getElementById('score'),damage:document.getElementById('damage'),progress:document.getElementById('progress'),objective:document.getElementById('objective'),veil:document.getElementById('veil'),title:document.getElementById('title'),eyebrow:document.getElementById('eyebrow'),copy:document.getElementById('copy'),start:document.getElementById('start'),toast:document.getElementById('toast')};
const W=1200,H=760;let dpr=1,viewW=0,viewH=0,scale=1,offsetX=0,offsetY=0,last=0,active=false,level=1,score=0,damage=0,toastTimer=0,particleTimer=0,crashCooldown=0;
const keys={up:false,down:false,left:false,right:false,brake:false,gas:false};
const car={x:180,y:492,a:0,v:0,steer:0,skid:0};
const palette=['#b94c36','#3f6d79','#d1ae61','#52634b','#8e5d78','#526b8b','#c4c0ad'];
let props=[],parked=[],target={x:710,y:300,a:0},traffic=[],particles=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);viewW=r.width;viewH=r.height;const portrait=viewW<700&&viewH>viewW;scale=portrait?viewH/H:Math.min(viewW/W,viewH/H);offsetX=(viewW-W*scale)/2;offsetY=(viewH-H*scale)/2;ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize);resize();
function resetLevel(){car.x=590;car.y=300;car.a=0;car.v=0;car.steer=0;crashCooldown=0;damage=Math.max(0,damage);traffic=[];particles=[];parked=[{x:365,y:300,a:0,color:'#78877e'},{x:480,y:300,a:0,color:'#a24939'},{x:940,y:300,a:0,color:'#465c73'},{x:1055,y:300,a:0,color:'#bb9f67'}];target={x:710,y:300,a:0};for(let i=0;i<Math.min(3,1+Math.floor(level/2));i++)traffic.push({x:1250+i*430,y:i%2?552:411,a:i%2?Math.PI:0,v:(i%2?-1:1)*(75+level*5),color:palette[(i+2)%palette.length],length:60,width:31});buildProps();updateHUD()}
function buildProps(){props=[];for(let x=28;x<1180;x+=110){props.push({type:'tree',x,y:133+(x%3)*7,r:15+(x%3)*2});props.push({type:'lamp',x:x+52,y:205});props.push({type:'tree',x:x+45,y:663,r:15});}for(let i=0;i<8;i++)props.push({type:'crack',x:70+i*147,y:365+(i%3)*17});}
function updateHUD(){ui.level.textContent=String(level).padStart(2,'0');ui.score.textContent=String(score).padStart(4,'0');ui.damage.innerHTML=`${damage}<em>%</em>`;ui.progress.style.width=`${Math.min(100,(level-1)*12.5)}%`;}
function notify(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),2100)}
function startGame(){active=true;ui.veil.classList.add('hidden');last=performance.now();requestAnimationFrame(frame)}
ui.start.onclick=()=>{if(level===1&&score===0)resetLevel();startGame()};
function finishRound(){active=false;const alignment=Math.abs(Math.atan2(Math.sin(car.a-target.a),Math.cos(car.a-target.a)));let stars=damage===0&&alignment<.12?3:damage<15&&alignment<.28?2:1;let award=stars*250+Math.max(0,100-Math.round(Math.abs(car.x-target.x)))*2;score+=award;updateHUD();ui.eyebrow.textContent=stars===3?'TEXTBOOK PARKING':stars===2?'NICE AND TIDY':'SPACE SECURED';ui.title.innerHTML=stars===3?'BEAUTIFULLY<br>DONE.':stars===2?'GOOD<br>WORK.':'YOU\'RE<br>IN.';ui.copy.textContent=`${stars} ${stars===1?'star':'stars'} earned · +${award} points. ${damage===0?'Not a scratch on it.':`Vehicle damage: ${damage}%.`} Ready for a tighter space?`;ui.start.textContent='NEXT PARKING BAY  →';ui.start.onclick=()=>{level++;damage=0;resetLevel();ui.start.onclick=null;ui.eyebrow.textContent='A little patience. A clean line.';ui.title.innerHTML='PARK<br>LIKE A PRO.';ui.copy.textContent='The city is yours, one parking space at a time. Ease into the marked bay without touching the cars around you.';ui.start.textContent='START YOUR SHIFT  →';startGame()};ui.veil.classList.remove('hidden')}
function crash(intensity){if(crashCooldown>0)return;crashCooldown=.9;damage=clamp(damage+Math.round(4+clamp(intensity,0,1)*8),0,99);car.v*=-.22;car.x-=Math.cos(car.a)*12;car.y-=Math.sin(car.a)*12;car.skid=.35;updateHUD();notify('CONTACT — EASY DOES IT');for(let i=0;i<9;i++)particles.push({x:car.x,y:car.y,vx:(Math.random()-.5)*100,vy:(Math.random()-.5)*100,t:.35,color:'#f2ce76'})}
function keyChange(e,on){const k=e.key.toLowerCase();const map={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right',' ':'brake',shift:'brake'};if(map[k]){keys[map[k]]=on;e.preventDefault()};if(k==='r'&&on){resetLevel();notify('CAR RESET')};if(k==='escape'&&on&&active){active=false;ui.eyebrow.textContent='SHIFT PAUSED';ui.title.innerHTML='TAKE A<br>BREATHER.';ui.copy.textContent='Your parking bay will be right here when you’re ready.';ui.start.textContent='RESUME SHIFT  →';ui.start.onclick=()=>{ui.start.onclick=null;ui.start.textContent='START YOUR SHIFT  →';ui.eyebrow.textContent='A little patience. A clean line.';ui.title.innerHTML='PARK<br>LIKE A PRO.';ui.copy.textContent='The city is yours, one parking space at a time. Ease into the marked bay without touching the cars around you.';startGame()};ui.veil.classList.remove('hidden')}}
window.addEventListener('keydown',e=>keyChange(e,true));window.addEventListener('keyup',e=>keyChange(e,false));window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
document.querySelectorAll('[data-control]').forEach(b=>{const c=b.dataset.control;const down=e=>{e.preventDefault();keys[c==='gas'?'up':c]=true;b.classList.add('active');try{b.setPointerCapture(e.pointerId)}catch{}};const up=e=>{e.preventDefault();keys[c==='gas'?'up':c]=false;b.classList.remove('active')};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
function update(dt){if(!active)return;crashCooldown=Math.max(0,crashCooldown-dt);const forward=(keys.up||keys.gas)?1:0,reverse=keys.down?1:0,steer=(keys.right?1:0)-(keys.left?1:0);const max=level>3?165:155;
if(forward)car.v+=245*dt;if(reverse)car.v-=190*dt;if(keys.brake)car.v*=Math.pow(.035,dt);else car.v*=Math.pow(.986,dt);car.v=clamp(car.v,-92,max);if(Math.abs(car.v)<1.2)car.v=0;
const speedFactor=clamp(Math.abs(car.v)/45,0,1);car.steer+=(steer-car.steer)*Math.min(1,dt*7);car.a+=car.steer*speedFactor*(car.v>=0?1:-1)*1.8*dt;
car.x+=Math.cos(car.a)*car.v*dt;car.y+=Math.sin(car.a)*car.v*dt;
if(car.y<231){car.y=231;crash(.5)}if(car.y>610){car.y=610;crash(.4)}if(car.x<28||car.x>1172){car.x=clamp(car.x,28,1172);crash(.5)}
for(const p of parked){const dx=car.x-p.x,dy=car.y-p.y;if(Math.abs(dx)<63&&Math.abs(dy)<40){const nx=Math.sign(dx)||1,ny=Math.sign(dy)||1;car.x+=nx*(63-Math.abs(dx)+1);car.y+=ny*(40-Math.abs(dy)+1);crash(Math.abs(car.v)/200)}}
for(const t of traffic){t.x+=t.v*dt;if(t.x<-90)t.x=1290;if(t.x>1290)t.x=-90;let dx=car.x-t.x,dy=car.y-t.y;if(Math.abs(dx)<55&&Math.abs(dy)<34){car.x+=Math.sign(dx||1)*8;crash(Math.abs(car.v)/210)}}
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt}particles=particles.filter(p=>p.t>0);
const dx=car.x-target.x,dy=car.y-target.y,angle=Math.abs(Math.atan2(Math.sin(car.a-target.a),Math.cos(car.a-target.a))),inside=Math.abs(dx)<72&&Math.abs(dy)<29&&angle<.34;
if(inside&&Math.abs(car.v)<8){particleTimer+=dt;if(particleTimer>.6){particleTimer=0;finishRound()}}else particleTimer=0;
if(car.v<18&&car.v>-18&&Math.abs(car.x-target.x)<85&&Math.abs(car.y-target.y)<44)ui.objective.innerHTML='<strong>Almost there:</strong> straighten up and come to a full stop';else ui.objective.innerHTML='<strong>Objective:</strong> park inside the highlighted bay';}
function frame(now){if(!active)return;const dt=Math.min(.035,(now-last)/1000||0);last=now;update(dt);draw();if(active)requestAnimationFrame(frame)}
function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,viewW,viewH);ctx.save();const portrait=viewW<700&&viewH>viewW,cameraLeft=portrait?clamp(car.x-viewW/scale*.38,0,W-viewW/scale):0;ctx.translate(portrait?-cameraLeft*scale:offsetX,offsetY);ctx.scale(scale,scale);drawCity();drawTarget();for(const p of parked)drawCar(p.x,p.y,p.a,p.color,false);for(const t of traffic)drawCar(t.x,t.y,t.a,t.color,false,t.length,t.width);drawCar(car.x,car.y,car.a,damage>45?'#9c4939':'#d6d5ca',true);drawParticles();drawSpeed();ctx.restore()}
function drawCity(){
// warm concrete buildings and sidewalk
const sky=ctx.createLinearGradient(0,0,0,220);sky.addColorStop(0,'#52635f');sky.addColorStop(.7,'#66746c');sky.addColorStop(1,'#778176');ctx.fillStyle=sky;ctx.fillRect(0,0,W,220);
ctx.fillStyle='#a79679';ctx.fillRect(0,0,W,152);ctx.fillStyle='#c1b292';ctx.fillRect(0,145,W,12);
// storefront panels
for(let x=0;x<W;x+=184){ctx.fillStyle=x%3?'#27383a':'#314142';ctx.fillRect(x+12,39,154,91);ctx.fillStyle='#b8ac8c';ctx.fillRect(x+8,33,162,9);ctx.fillStyle='#a79d82';ctx.fillRect(x+20,50,53,70);ctx.fillStyle='#394e4e';ctx.fillRect(x+79,50,76,70);ctx.fillStyle='#657570';ctx.fillRect(x+84,56,65,58);ctx.fillStyle='#d2c49f';ctx.fillRect(x+8,135,162,7);ctx.fillStyle='#e7d9ad';ctx.fillRect(x+18,18,44,5);ctx.fillStyle='#7d7662';ctx.fillRect(x+18,22,44,2)}
// upper sidewalk tiles
ctx.fillStyle='#b7ad96';ctx.fillRect(0,160,W,94);for(let x=0;x<W;x+=56){ctx.strokeStyle='#8c887a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,160);ctx.lineTo(x,254);ctx.stroke()}ctx.strokeStyle='#d3c8ad';ctx.beginPath();ctx.moveTo(0,249);ctx.lineTo(W,249);ctx.stroke();
// roadway asphalt
const road=ctx.createLinearGradient(0,254,0,630);road.addColorStop(0,'#505856');road.addColorStop(.45,'#444c4b');road.addColorStop(1,'#3b4544');ctx.fillStyle=road;ctx.fillRect(0,254,W,376);
// subtle asphalt flecks
for(let i=0;i<100;i++){let x=(i*173+31)%W,y=264+(i*79)%355;ctx.fillStyle=i%2?'#ffffff08':'#111a1910';ctx.fillRect(x,y,2+(i%3),1)}
// lane divider and road-edge paint
ctx.strokeStyle='#d5c89995';ctx.lineWidth=2;ctx.setLineDash([30,24]);ctx.beginPath();ctx.moveTo(0,430);ctx.lineTo(W,430);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#eee1b45c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,624);ctx.lineTo(W,624);ctx.stroke();
// lower curb / paved verge
ctx.fillStyle='#b5aa92';ctx.fillRect(0,630,W,80);for(let x=0;x<W;x+=58){ctx.strokeStyle='#8c887a';ctx.beginPath();ctx.moveTo(x,630);ctx.lineTo(x,710);ctx.stroke()}ctx.fillStyle='#c2b9a2';ctx.fillRect(0,630,W,5);ctx.fillStyle='#807c70';ctx.fillRect(0,706,W,8);
// parking bay guides
ctx.strokeStyle='#ede2c5b0';ctx.lineWidth=2;ctx.setLineDash([13,9]);for(let x=305;x<=1115;x+=115){ctx.beginPath();ctx.moveTo(x,252);ctx.lineTo(x,349);ctx.stroke()}ctx.setLineDash([]);
// neighborhood props
for(const p of props){if(p.type==='tree')drawTree(p.x,p.y,p.r);else if(p.type==='lamp')drawLamp(p.x,p.y);else{ctx.strokeStyle='#202a2860';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+15,p.y+5);ctx.stroke()}}
// sidewalk drain grates
for(let x=70;x<1200;x+=275){ctx.fillStyle='#777b70';ctx.fillRect(x,239,30,6);ctx.strokeStyle='#444b45';for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x+j*6,240);ctx.lineTo(x+j*6,244);ctx.stroke()}}
}
function drawTarget(){const pulse=.5+.5*Math.sin(performance.now()*.003);ctx.save();ctx.translate(target.x,target.y);ctx.rotate(target.a);ctx.fillStyle=`rgba(210,237,117,${.1+pulse*.06})`;ctx.fillRect(-62,-27,124,54);ctx.strokeStyle=`rgba(222,246,152,${.62+pulse*.3})`;ctx.lineWidth=2;ctx.setLineDash([9,6]);ctx.strokeRect(-62,-27,124,54);ctx.setLineDash([]);ctx.fillStyle='#d2ed75';ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillText('PARK HERE',0,-37);ctx.strokeStyle='#d2ed75';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-44,0);ctx.lineTo(42,0);ctx.lineTo(32,-7);ctx.moveTo(42,0);ctx.lineTo(32,7);ctx.stroke();ctx.restore()}
function drawCar(x,y,a,color,isPlayer,length=68,width=34){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#11181770';roundRect(ctx,-length*.48+4,-width*.48+6,length,width,8);ctx.fill();
// tires
ctx.fillStyle='#202526';for(const xx of [-length*.29,length*.25])for(const yy of [-width*.54,width*.4]){roundRect(ctx,xx-9,yy,19,7,3);ctx.fill()}
// sculpted body
let body=ctx.createLinearGradient(0,-width/2,0,width/2);body.addColorStop(0,lighten(color,22));body.addColorStop(.35,color);body.addColorStop(1,darken(color,32));ctx.fillStyle=body;roundRect(ctx,-length/2,-width/2,length,width,9);ctx.fill();
// hood and trunk panels
ctx.fillStyle='#ffffff15';roundRect(ctx,length*.14,-width*.38,length*.25,width*.76,5);ctx.fill();ctx.strokeStyle='#10191855';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(length*.12,-width*.36);ctx.lineTo(length*.12,width*.36);ctx.moveTo(-length*.27,-width*.34);ctx.lineTo(-length*.27,width*.34);ctx.stroke();
// windows and center pillar
ctx.fillStyle='#182a30';ctx.beginPath();ctx.moveTo(-length*.19,-width*.37);ctx.lineTo(length*.14,-width*.37);ctx.lineTo(length*.08,-width*.2);ctx.lineTo(-length*.2,-width*.2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-length*.19,width*.37);ctx.lineTo(length*.14,width*.37);ctx.lineTo(length*.08,width*.2);ctx.lineTo(-length*.2,width*.2);ctx.closePath();ctx.fill();ctx.fillStyle='#a5b8b7';ctx.fillRect(-length*.015,-width*.37,2,width*.74);
// front fascia, headlights and rear lamps
ctx.fillStyle='#303737';roundRect(ctx,length*.39,-width*.31,length*.09,width*.62,3);ctx.fill();ctx.fillStyle='#f3e7bd';roundRect(ctx,length*.42,-width*.35,5,7,2);ctx.fill();roundRect(ctx,length*.42,width*.15,5,7,2);ctx.fill();ctx.fillStyle='#d65e4d';ctx.fillRect(-length*.49,-width*.32,4,7);ctx.fillRect(-length*.49,width*.12,4,7);
ctx.strokeStyle='#ffffff65';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-length*.3,-width*.44);ctx.lineTo(length*.32,-width*.44);ctx.stroke();if(isPlayer){ctx.fillStyle='#d2ed75';ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill()}ctx.restore()}
function lighten(hex,amt){return alter(hex,amt)}function darken(hex,amt){return alter(hex,-amt)}function alter(hex,amt){const n=parseInt(hex.slice(1),16),r=clamp((n>>16)+amt,0,255),g=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);return `rgb(${r},${g},${b})`}
function drawParticles(){for(const p of particles){ctx.globalAlpha=clamp(p.t/.35,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2+p.t*5,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
function drawSpeed(){const x=1124,y=570;ctx.save();ctx.fillStyle='#172329cc';ctx.strokeStyle='#ffffff36';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,38,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#9eaeae';ctx.textAlign='center';ctx.font='8px system-ui';ctx.fillText('KM/H',x,y-13);ctx.fillStyle='#f4f1e8';ctx.font='bold 20px system-ui';ctx.fillText(String(Math.round(Math.abs(car.v)*.42)),x,y+9);ctx.fillStyle='#d2ed75';ctx.font='8px system-ui';ctx.fillText(car.v<0?'R':Math.abs(car.v)<1?'P':'D',x,y+23);ctx.restore()}
// Draw once under the title screen so the city is already alive.
resetLevel();draw();
function drawTree(x,y,r){ctx.fillStyle='#1b282455';ctx.beginPath();ctx.ellipse(x+4,y+7,r+4,r*.77,0,0,Math.PI*2);ctx.fill();let g=ctx.createRadialGradient(x-r*.25,y-r*.35,2,x,y,r);g.addColorStop(0,'#91a17d');g.addColorStop(.6,'#526952');g.addColorStop(1,'#344b40');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a8ae8a55';ctx.beginPath();ctx.arc(x-r*.22,y-r*.27,r*.33,0,Math.PI*2);ctx.fill()}
function drawLamp(x,y){ctx.fillStyle='#4b4d43';ctx.fillRect(x-2,y-2,4,43);ctx.fillRect(x-7,y+39,14,4);ctx.strokeStyle='#44483f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-1);ctx.lineTo(x,y-15);ctx.lineTo(x+7,y-18);ctx.stroke();ctx.fillStyle='#e7d49a';ctx.beginPath();ctx.arc(x+7,y-18,3,0,Math.PI*2);ctx.fill()}

})();
