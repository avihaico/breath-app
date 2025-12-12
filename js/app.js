// BreathFlow - advanced single-file logic
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const phase = document.getElementById('phase');
const core = document.getElementById('core');
const pulse = document.getElementById('pulse');
const presets = document.querySelectorAll('.preset');
const audioToggle = document.getElementById('audioToggle');
const videoToggle = document.getElementById('videoToggle');
const bgVideo = document.getElementById('bgVideo');
const oceanAudio = document.getElementById('oceanAudio');

let running = false;
let timer = null;
let cycle = { inhale:4, inhaleHold:0, exhale:6, exhaleHold:0 };

// ensure audio context unlocked on user gesture
function unlockAudio(){
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(AudioCtx && !window._audioUnlocked){
      const ctx = new AudioCtx();
      const buffer = ctx.createBuffer(1,1,22050);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
      window._audioUnlocked = true;
    }
  }catch(e){ console.log('audio unlock', e) }
}

function animateVisual(scale, dur){
  core.style.transition = `transform ${dur}s cubic-bezier(.22,.9,.23,1)`;
  core.style.transform = `scale(${scale})`;
  pulse.style.transition = `transform ${dur}s linear`;
  pulse.style.transform = `scale(${scale * 0.65})`;
}

function setPhaseText(t){ phase.textContent = t; }

function runCycle(){
  if(!running) return;
  setPhaseText('Inhale');
  animateVisual(1.18, cycle.inhale);
  if(audioToggle.checked && oceanAudio.src) oceanAudio.play().catch(()=>{});
  timer = setTimeout(()=>{
    if(!running) return;
    if(cycle.inhaleHold>0){
      setPhaseText('Hold');
      timer = setTimeout(()=> doExhale(), cycle.inhaleHold*1000);
    } else doExhale();
  }, cycle.inhale*1000);
}

function doExhale(){
  if(!running) return;
  setPhaseText('Exhale');
  animateVisual(0.86, cycle.exhale);
  timer = setTimeout(()=>{
    if(!running) return;
    if(cycle.exhaleHold>0){
      setPhaseText('Hold');
      timer = setTimeout(()=> runCycle(), cycle.exhaleHold*1000);
    } else runCycle();
  }, cycle.exhale*1000);
}

startBtn.addEventListener('click', ()=>{
  unlockAudio();
  if(!running){
    running = true;
    startBtn.textContent = 'Pause';
    stopBtn.disabled = false;
    // if video was muted by default and you want sound, ensure bgVideo.muted = false only after gesture
    if(bgVideo && bgVideo.paused) try{ bgVideo.play(); }catch(e){}
    runCycle();
  } else {
    running = false;
    startBtn.textContent = 'Start';
    if(timer) clearTimeout(timer);
    animateVisual(1, 0.2);
    if(oceanAudio){ oceanAudio.pause(); oceanAudio.currentTime = 0; }
    setPhaseText('Paused');
  }
});

stopBtn.addEventListener('click', ()=>{
  running = false;
  if(timer) clearTimeout(timer);
  animateVisual(1,0.2);
  if(oceanAudio){ oceanAudio.pause(); oceanAudio.currentTime = 0; }
  startBtn.textContent = 'Start';
  stopBtn.disabled = true;
  setPhaseText('Ready');
});

// presets
presets.forEach(p => p.addEventListener('click', ()=>{
  cycle = {
    inhale: parseFloat(p.dataset.in),
    inhaleHold: parseFloat(p.dataset.holdin),
    exhale: parseFloat(p.dataset.ex),
    exhaleHold: parseFloat(p.dataset.holdex)
  };
  setPhaseText(p.textContent);
}));

// video toggle
videoToggle.addEventListener('change', ()=>{
  if(videoToggle.checked){
    bgVideo.style.display = '';
  } else {
    bgVideo.style.display = 'none';
  }
});
