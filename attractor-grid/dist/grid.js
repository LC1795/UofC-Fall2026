'use strict';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const rotation = document.querySelector('#rotation');
const shift = document.querySelector('#shift');
const radius = document.querySelector('#radius');
const micSensitivity=document.querySelector('#mic-sensitivity');
micSensitivity.addEventListener('input',()=>{document.querySelector('#mic-sensitivity-value').value=Number(micSensitivity.value).toFixed(1)+'×';});
function audioIntensity(rms){return Math.min(1,Math.max(0,(rms-.008)/.15)*Number(micSensitivity.value));}
let micMode=false,micPending=false,micLevel=0,micRequest=0,micStream=null,micContext=null,micSource=null,micAnalyser=null,micFrame=0;
const micButton=document.querySelector('#mic-toggle'),micStatus=document.querySelector('#mic-status'),micMeter=document.querySelector('#mic-level');
let palmNearness=0,palmNearnessTarget=0,vibrationTime=0;
let cameraMode=false,cameraPending=false,cameraRequest=0,cameraStream=null,handTracker=null,cameraFrame=0;
const cameraButton=document.querySelector('#camera-toggle'),cameraStatus=document.querySelector('#camera-status'),cameraVideo=document.querySelector('#camera-preview');
let seed = 2161218;
function uniform() { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; }
// Sample once: independent uniform signed rotation and Cartesian displacement.
let columns=12,rows=18;
let points = Array.from({length:216}, (_,i) => ({x:i%12+.5,y:Math.floor(i/12)+.5,r:uniform()*2-1,dx:uniform()*2-1,dy:uniform()*2-1}));
const pointCache=new Map(points.map(p=>[`${p.x},${p.y}`,p]));
let width=0,height=0,cell=0,ox=0,oy=0;
const mouse={x:6,y:9,active:false};
function draw(){
 ctx.clearRect(0,0,width,height);
 ctx.strokeStyle='#111';ctx.lineWidth=1;
 for(const p of points){
  const distance=Math.hypot(p.x-mouse.x,p.y-mouse.y);
  const t=(mouse.active||micMode||cameraMode)?Math.max(0,1-distance/Number(radius.value)):0;
  const falloff=t*t*(3-2*t);
  const influence=falloff*(micMode?micLevel:1);
  const shake=cameraMode?palmNearness*.28*falloff:0;
  const phase=p.r*7+p.dx*11+p.dy*17;
  const jitterX=shake*Math.sin(vibrationTime*47+phase);
  const jitterY=shake*Math.sin(vibrationTime*59+phase*1.7);
  const jitterAngle=shake*.3*Math.sin(vibrationTime*41+phase*2.3);
  const travel=Number(shift.value)*influence;
  // A bounded pull toward the cursor plus independent signed XY variation.
  const pullX=(mouse.x-p.x)/Math.max(1,distance);
  const pullY=(mouse.y-p.y)/Math.max(1,distance);
  ctx.save();ctx.translate(ox+(p.x+travel*(.55*pullX+.45*p.dx)+jitterX)*cell,oy+(p.y+travel*(.55*pullY+.45*p.dy)+jitterY)*cell);
  ctx.rotate(p.r*Number(rotation.value)*Math.PI/180*influence+jitterAngle);
  ctx.strokeRect(-cell/2,-cell/2,cell,cell);ctx.restore();
 }
 ctx.fillStyle='#2450ff';
 for(const p of points){ctx.beginPath();ctx.arc(ox+p.x*cell,oy+p.y*cell,Math.max(1.5,Math.min(2.5,cell*.075)),0,Math.PI*2);ctx.fill();}
}
function resize(){
 const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
 const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 // Reserve space for maximum displacement and rotated corners at every size.
 cell=Math.min(width/(columns+6),height/(rows+6));ox=(width-cell*columns)/2;oy=(height-cell*rows)/2;draw();
}
function updateDimensions(){
 columns=Number(document.querySelector('#columns').value);rows=Number(document.querySelector('#rows').value);
 points=Array.from({length:columns*rows},(_,i)=>{const x=i%columns+.5,y=Math.floor(i/columns)+.5,key=x+','+y;if(!pointCache.has(key)){pointCache.set(key,{x,y,r:uniform()*2-1,dx:uniform()*2-1,dy:uniform()*2-1});}return pointCache.get(key);});
 document.querySelector('#columns-value').value=columns;document.querySelector('#rows-value').value=rows;
 document.querySelector('#point-count').textContent=points.length+' fixed points';document.querySelector('#dimensions').textContent=columns+' columns × '+rows+' rows';document.querySelector('#grid-size').textContent=columns+' × '+rows;
 canvas.setAttribute('aria-label','Grid of '+points.length+' stationary blue points and transforming black squares. Move your pointer or use arrow keys to position the attractor; press Escape to reset.');
 mouse.x=Math.min(columns,mouse.x);mouse.y=Math.min(rows,mouse.y);resize();
}
document.querySelector('#columns').addEventListener('input',updateDimensions);document.querySelector('#rows').addEventListener('input',updateDimensions);
function updateControls(){document.querySelector('#rotation-value').value=rotation.value+'°';document.querySelector('#shift-value').value=Number(shift.value).toFixed(2)+' cells';draw();}
radius.addEventListener('input',()=>{document.querySelector('#radius-value').value=Number(radius.value)+' cells';draw();});
rotation.addEventListener('input',updateControls);shift.addEventListener('input',updateControls);
canvas.addEventListener('pointermove',event=>{if(cameraMode)return;const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left-ox)/cell;mouse.y=(event.clientY-rect.top-oy)/cell;mouse.active=true;draw();});
canvas.addEventListener('pointerdown',event=>{if(cameraMode)return;canvas.focus();canvas.setPointerCapture(event.pointerId);const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left-ox)/cell;mouse.y=(event.clientY-rect.top-oy)/cell;mouse.active=true;draw();});
canvas.addEventListener('pointerleave',()=>{if(cameraMode)return;mouse.active=false;draw();});
canvas.addEventListener('pointercancel',()=>{if(cameraMode)return;mouse.active=false;draw();});
canvas.addEventListener('keydown',event=>{if(cameraMode)return;const delta={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]}[event.key];if(delta){event.preventDefault();mouse.active=true;mouse.x=Math.max(0,Math.min(columns,mouse.x+delta[0]));mouse.y=Math.max(0,Math.min(rows,mouse.y+delta[1]));draw();}if(event.key==='Escape'){mouse.active=false;draw();}});
new ResizeObserver(resize).observe(canvas);
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'set_grid_influence',description:'Set rotation in degrees and shift in grid cells using the visible sliders.',inputSchema:{type:'object',properties:{rotation:{type:'number',minimum:0,maximum:180},shift:{type:'number',minimum:0,maximum:2}},required:['rotation','shift'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!Number.isFinite(input.rotation)||input.rotation<0||input.rotation>180||!Number.isFinite(input.shift)||input.shift<0||input.shift>2)throw new Error('Influence is outside the slider range.');rotation.value=String(input.rotation);shift.value=String(input.shift);updateControls();return {rotation:Number(rotation.value),shift:Number(shift.value)};}})).catch(()=>{});}catch{}}

function stopMicrophone(message='Microphone off.'){
 micRequest++;micMode=false;micPending=false;cancelAnimationFrame(micFrame);
 if(micStream)micStream.getTracks().forEach(track=>track.stop());
 if(micSource)micSource.disconnect();
 if(micContext)micContext.close().catch(()=>{});
 micStream=null;micContext=null;micSource=null;micAnalyser=null;micLevel=0;micMeter.value=0;
 micButton.setAttribute('aria-pressed','false');micButton.textContent='Control: Sliders · Enable mic';micStatus.textContent=message;draw();
}
async function startMicrophone(){
 const id=++micRequest;micPending=true;micButton.textContent='Cancel microphone';micStatus.textContent='Allow microphone access in your browser.';
 let stream=null,context=null;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone access is unavailable in this browser.');
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)throw new Error('Audio analysis is unavailable in this browser.');
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false},video:false});
  if(id!==micRequest){stream.getTracks().forEach(track=>track.stop());return;}
  context=new AudioContext();await context.resume();
  if(id!==micRequest){stream.getTracks().forEach(track=>track.stop());await context.close();return;}
  micStream=stream;micContext=context;micSource=context.createMediaStreamSource(stream);micAnalyser=context.createAnalyser();micAnalyser.fftSize=1024;
  micSource.connect(micAnalyser); // No connection to speakers, recording, or upload.
  micMode=true;micPending=false;micButton.setAttribute('aria-pressed','true');micButton.textContent='Control: Microphone · Use sliders';micStatus.textContent='Listening · louder sound increases intensity.';
  for(const track of stream.getTracks())track.addEventListener('ended',()=>{if(id===micRequest)stopMicrophone('Microphone disconnected. Sliders restored.');});
  const samples=new Float32Array(micAnalyser.fftSize);let previous=0;
  function animate(now){if(id!==micRequest||!micMode)return;
   micAnalyser.getFloatTimeDomainData(samples);let energy=0;for(const value of samples)energy+=value*value;
   const rms=Math.sqrt(energy/samples.length),target=audioIntensity(rms);
   const dt=previous?Math.min((now-previous)/1000,.1):1/60;previous=now;
   micLevel+=(target-micLevel)*(1-Math.exp(-dt/(target>micLevel?.06:.25)));
   micMeter.value=micLevel;draw();micFrame=requestAnimationFrame(animate);
  }
  micFrame=requestAnimationFrame(animate);
 }catch(error){
  if(stream)stream.getTracks().forEach(track=>track.stop());if(context)context.close().catch(()=>{});
  if(id===micRequest)stopMicrophone(error.name==='NotAllowedError'?'Microphone permission denied. Sliders remain active.':error.name==='NotFoundError'?'No microphone found. Sliders remain active.':'Could not start microphone. Sliders remain active.');
 }
}
micButton.addEventListener('click',()=>{if(micMode||micPending)stopMicrophone();else startMicrophone();});
window.addEventListener('pagehide',()=>stopMicrophone());

function estimatePalmNearness(hand){
 // Apparent palm dimensions are a proximity proxy, not measured depth.
 const aspect=cameraVideo.videoWidth&&cameraVideo.videoHeight?cameraVideo.videoWidth/cameraVideo.videoHeight:4/3;
 const span=(a,b)=>Math.hypot((hand[a].x-hand[b].x)*aspect,hand[a].y-hand[b].y);
 const size=Math.max(span(5,17),span(0,9));
 const t=Math.max(0,Math.min(1,(size-.09)/.32));return t*t*(3-2*t);
}
function applyPalm(landmarks){
 if(!landmarks?.length){palmNearnessTarget=0;cameraStatus.textContent='No hand detected · holding position.';return;}
 palmNearnessTarget=estimatePalmNearness(landmarks[0]);
 const ids=[0,5,9,13,17];let x=0,y=0;for(const i of ids){x+=landmarks[0][i].x;y+=landmarks[0][i].y;}
 const targetX=Math.max(0,Math.min(1,1-x/ids.length))*columns;
 const targetY=Math.max(0,Math.min(1,y/ids.length))*rows;
 mouse.x+=(targetX-mouse.x)*.4;mouse.y+=(targetY-mouse.y)*.4;mouse.active=true;
 cameraStatus.textContent='Palm tracked · move your hand to steer.';draw();
}
function stopCamera(message='Camera off. Mouse control restored.'){
 palmNearness=0;palmNearnessTarget=0;document.querySelector('#palm-vibration').value='0%';
 cameraRequest++;cameraMode=false;cameraPending=false;cancelAnimationFrame(cameraFrame);
 if(cameraStream)cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null;
 if(handTracker)handTracker.close();handTracker=null;
 cameraVideo.pause();cameraVideo.srcObject=null;cameraVideo.hidden=true;
 cameraButton.setAttribute('aria-pressed','false');cameraButton.textContent='Position: Mouse · Enable camera';cameraStatus.textContent=message;draw();
}
async function startCamera(){
 const id=++cameraRequest;cameraPending=true;cameraButton.textContent='Cancel camera';cameraStatus.textContent='Allow camera access to track your palm.';
 let stream=null,tracker=null;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera unavailable');
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
  if(id!==cameraRequest){stream.getTracks().forEach(t=>t.stop());return;}
  cameraStream=stream;cameraVideo.srcObject=stream;cameraVideo.hidden=false;await cameraVideo.play();
  cameraStatus.textContent='Loading hand tracking…';
  const {FilesetResolver,HandLandmarker}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
  if(id!==cameraRequest)return;
  const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
  if(id!==cameraRequest)return;
  tracker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});
  if(id!==cameraRequest){tracker.close();return;}
  handTracker=tracker;cameraMode=true;cameraPending=false;mouse.active=true;
  cameraButton.setAttribute('aria-pressed','true');cameraButton.textContent='Position: Palm · Use mouse';cameraStatus.textContent='Show your palm · holding position.';
  for(const track of stream.getTracks())track.addEventListener('ended',()=>{if(id===cameraRequest)stopCamera('Camera disconnected. Mouse control restored.');});
  let lastTime=-1,lastFrame=0,lastAnimation=0;
  function trackPalm(now){if(id!==cameraRequest||!cameraMode)return;
   const dt=lastAnimation?Math.min((now-lastAnimation)/1000,.1):1/60;lastAnimation=now;
   palmNearness+=(palmNearnessTarget-palmNearness)*(1-Math.exp(-dt/.18));vibrationTime=now/1000;
   document.querySelector('#palm-vibration').value=Math.round(palmNearness*100)+'%';draw();
   try{if(cameraVideo.readyState>=2&&cameraVideo.currentTime!==lastTime&&now-lastFrame>=65){lastTime=cameraVideo.currentTime;lastFrame=now;applyPalm(handTracker.detectForVideo(cameraVideo,now).landmarks);}}
   catch(error){stopCamera('Hand tracking failed. Try enabling the camera again.');return;}
   cameraFrame=requestAnimationFrame(trackPalm);
  }
  cameraFrame=requestAnimationFrame(trackPalm);
 }catch(error){
  if(id!==cameraRequest){if(stream)stream.getTracks().forEach(t=>t.stop());return;}
  stopCamera(error.name==='NotAllowedError'?'Camera permission denied. Mouse control remains active.':error.name==='NotFoundError'?'No camera found. Mouse control remains active.':'Could not load camera tracking. Check your camera and internet connection, then retry.');
 }
}
cameraButton.addEventListener('click',()=>{if(cameraMode||cameraPending)stopCamera();else startCamera();});
window.addEventListener('pagehide',()=>stopCamera());
