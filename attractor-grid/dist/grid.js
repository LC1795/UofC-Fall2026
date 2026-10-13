'use strict';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const rotation = document.querySelector('#rotation');
const shift = document.querySelector('#shift');
let seed = 2161218;
function uniform() { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; }
// Sample once: independent uniform signed rotation and Cartesian displacement.
const points = Array.from({length:216}, (_,i) => ({x:i%12+.5,y:Math.floor(i/12)+.5,r:uniform()*2-1,dx:uniform()*2-1,dy:uniform()*2-1}));
let width=0,height=0,cell=0,ox=0,oy=0;
const mouse={x:6,y:9,active:false};
function draw(){
 ctx.clearRect(0,0,width,height);
 ctx.strokeStyle='#111';ctx.lineWidth=1;
 for(const p of points){
  const distance=Math.hypot(p.x-mouse.x,p.y-mouse.y);
  const t=mouse.active?Math.max(0,1-distance/6):0;
  const influence=t*t*(3-2*t);
  const travel=Number(shift.value)*influence;
  // A bounded pull toward the cursor plus independent signed XY variation.
  const pullX=(mouse.x-p.x)/Math.max(1,distance);
  const pullY=(mouse.y-p.y)/Math.max(1,distance);
  ctx.save();ctx.translate(ox+(p.x+travel*(.55*pullX+.45*p.dx))*cell,oy+(p.y+travel*(.55*pullY+.45*p.dy))*cell);
  ctx.rotate(p.r*Number(rotation.value)*Math.PI/180*influence);
  ctx.strokeRect(-cell/2,-cell/2,cell,cell);ctx.restore();
 }
 ctx.fillStyle='#2450ff';
 for(const p of points){ctx.beginPath();ctx.arc(ox+p.x*cell,oy+p.y*cell,Math.max(1.5,Math.min(2.5,cell*.075)),0,Math.PI*2);ctx.fill();}
}
function resize(){
 const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
 const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 // Reserve space for maximum displacement and rotated corners at every size.
 cell=Math.min(width/18,height/24);ox=(width-cell*12)/2;oy=(height-cell*18)/2;draw();
}
function updateControls(){document.querySelector('#rotation-value').value=rotation.value+'°';document.querySelector('#shift-value').value=Number(shift.value).toFixed(2)+' cells';draw();}
rotation.addEventListener('input',updateControls);shift.addEventListener('input',updateControls);
canvas.addEventListener('pointermove',event=>{const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left-ox)/cell;mouse.y=(event.clientY-rect.top-oy)/cell;mouse.active=true;draw();});
canvas.addEventListener('pointerdown',event=>{canvas.focus();canvas.setPointerCapture(event.pointerId);const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left-ox)/cell;mouse.y=(event.clientY-rect.top-oy)/cell;mouse.active=true;draw();});
canvas.addEventListener('pointerleave',()=>{mouse.active=false;draw();});
canvas.addEventListener('pointercancel',()=>{mouse.active=false;draw();});
canvas.addEventListener('keydown',event=>{const delta={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]}[event.key];if(delta){event.preventDefault();mouse.active=true;mouse.x=Math.max(0,Math.min(12,mouse.x+delta[0]));mouse.y=Math.max(0,Math.min(18,mouse.y+delta[1]));draw();}if(event.key==='Escape'){mouse.active=false;draw();}});
new ResizeObserver(resize).observe(canvas);
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'set_grid_influence',description:'Set rotation in degrees and shift in grid cells using the visible sliders.',inputSchema:{type:'object',properties:{rotation:{type:'number',minimum:0,maximum:180},shift:{type:'number',minimum:0,maximum:2}},required:['rotation','shift'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!Number.isFinite(input.rotation)||input.rotation<0||input.rotation>180||!Number.isFinite(input.shift)||input.shift<0||input.shift>2)throw new Error('Influence is outside the slider range.');rotation.value=String(input.rotation);shift.value=String(input.shift);updateControls();return {rotation:Number(rotation.value),shift:Number(shift.value)};}})).catch(()=>{});}catch{}}
