// basic breathing cycle connected to Start button + audio handling
const startBtn = document.getElementById('startBtn');
const stopBtn  = document.getElementById('stopBtn');
const audioToggle = document.getElementById('audioToggle');
const breathCircle = document.getElementById('breathCircle');
const breathLabel = document.getElementById('breathLabel');
const oceanAudio = document.getElementById('oceanAudio');
const bgVideo = document.getElementById('bgVideo');

let running = false;
let timer = null;

// set asset paths (change if your path differs)
oceanAudio.src = 'assets/ocean.mp3';
bgVideo.querySelector('source')?.setAttribute('src', 'assets/bg.mp4');
// Note: if you changed index.html to include <source>, ensure it matches

// ensure video loads the new src (if changed dynamically)
function reloadVideo() {
  try {
    bgVideo.load();
  } catch(e){ console.warn('video reload failed', e) }
}

// unlock audio on first gesture (helps mobile browsers)
function unlockAudioContext() {
  // simple play/pause trick to satisfy gesture requirement
  oceanAudio.play().then(()=>{ oceanAudio.pause(); oceanAudio.currentTime = 0 }).catch(()=>{});
}

// animate circle (scale)
function animateCircle(scale, durationSec) {
  breathCircle.style.transition = `transform ${durationSec}s cubic-bezier(.22,.9,.23,1)`;
  breathCircle.style.transform = `scale(${scale})`;
}

// breathing pattern defaults (you can expose presets later)
const cycle = { inhale: 4, inhaleHold:0, exhale:6, exhaleHold:0 };

function setPhase(text){ breathLabel.textContent = text; }

function runCycle(){
  if (!running) return;
  setPhase('Inhale');
  animateCircle(1.15, cycle.inhale);
  if (audioToggle.checked && oceanAudio.src) oceanAudio.play().catch(()=>{});
  timer = setTimeout(()=>{
    if (!running) return;
    if (cycle.inhaleHold>0){
      setPhase('Hold');
      timer = setTimeout(()=> doExhale(), cycle.inhaleHold*1000);
    } else {
      doExhale();
    }
  }, cycle.inhale*1000);
}

function doExhale(){
  if (!running) return;
  setPhase('Exhale');
  animateCircle(0.82, cycle.exhale);
  timer = setTimeout(()=>{
    if (!running) return;
    if (cycle.exhaleHold>0){
      setPhase('Hold');
      timer = setTimeout(()=> runCycle(), cycle.exhaleHold*1000);
    } else {
      runCycle();
    }
  }, cycle.exhale*1000);
}

// Start / Stop wiring
startBtn.addEventListener('click', ()=>{
  unlockAudioContext();
  if (!running) {
    running = true;
    startBtn.textContent = 'Pause';
    stopBtn.disabled = false;
    runCycle();
  } else {
    // pause
    running = false;
    startBtn.textContent = 'Start';
    if (timer) clearTimeout(timer);
    animateCircle(1, 0.2);
    setPhase('Paused');
    if (oceanAudio) oceanAudio.pause();
  }
});

stopBtn.addEventListener('click', ()=>{
  running = false;
  if (timer) clearTimeout(timer);
  animateCircle(1,0.2);
  setPhase('Ready');
  startBtn.textContent = 'Start';
  stopBtn.disabled = true;
  if (oceanAudio){ oceanAudio.pause(); oceanAudio.currentTime = 0; }
});

// toggle: when audio box checked but audio file not loaded, console hint
audioToggle.addEventListener('change', ()=>{
  if (audioToggle.checked && !oceanAudio.src) {
    console.log("Please add assets/ocean.mp3 to enable ambient audio");
  } else if (!audioToggle.checked && oceanAudio) {
    oceanAudio.pause();
  }
});

// ensure video plays (some browsers require user gesture for unmuted; our video is muted by default)
reloadVideo();
