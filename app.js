const core = document.getElementById("core");
const phase = document.getElementById("phase");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const audioToggle = document.getElementById("audioToggle");
const ocean = document.getElementById("ocean");

let running = false;
let timer = null;

const cycle = {
  inhale: 4,
  inhaleHold: 0,
  exhale: 6,
  exhaleHold: 0
};

function setPhase(t) {
  phase.textContent = t;
}

function animate(scale, dur) {
  core.style.transition = `transform ${dur}s cubic-bezier(.23,1,.32,1)`;
  core.style.transform = `scale(${scale})`;
}

function runCycle() {
  if (!running) return;

  // INHALE
  setPhase("Inhale");
  animate(1.22, cycle.inhale);
  if (audioToggle.checked) ocean.play().catch(() => {});

  timer = setTimeout(() => {
    if (!running) return;

    // HOLD (after inhale)
    if (cycle.inhaleHold > 0) {
      setPhase("Hold");
      timer = setTimeout(() => doExhale(), cycle.inhaleHold * 1000);
    } else {
      doExhale();
    }
  }, cycle.inhale * 1000);
}

function doExhale() {
  if (!running) return;

  setPhase("Exhale");
  animate(0.82, cycle.exhale);

  timer = setTimeout(() => {
    if (!running) return;

    // HOLD (after exhale)
    if (cycle.exhaleHold > 0) {
      setPhase("Hold");
      timer = setTimeout(() => runCycle(), cycle.exhaleHold * 1000);
    } else {
      runCycle();
    }
  }, cycle.exhale * 1000);
}

// --- BUTTONS ---
startBtn.addEventListener("click", () => {
  if (!running) {
    running = true;
    startBtn.textContent = "Pause";
    stopBtn.disabled = false;
    runCycle();
  } else {
    // Pause
    running = false;
    startBtn.textContent = "Start";
    if (timer) clearTimeout(timer);
    setPhase("Paused");
    animate(1, 0.2);
    ocean.pause();
  }
});

stopBtn.addEventListener("click", () => {
  running = false;
  if (timer) clearTimeout(timer);
  animate(1, 0.2);
  ocean.pause();
  ocean.currentTime = 0;

  startBtn.textContent = "Start";
  stopBtn.disabled = true;
  setPhase("Ready");
});
