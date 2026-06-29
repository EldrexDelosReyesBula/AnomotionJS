import { Anomotion, EasingType, TextAnimation, globalLoop } from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d';
import '@eldrex/anomotionjs-physics';

// ─── PLAYGROUND STATE ────────────────────────────────────────────────────────

const state = {
  text: 'KINETIC GLYPH',
  effect: 'wave',
  duration: 1.8,
  stagger: 50,
  easing: 'easeOutElastic' as EasingType,
  renderer: 'dom' as 'dom' | 'canvas',
  textColor: '#f8fafc',
  bgColor: '#040406',
  gradType: 'none' as 'none' | 'linear' | 'radial',
  gradColor1: '#8b5cf6',
  gradColor2: '#06b6d4',
  gradAngle: 135,
  glowColor: '#8b5cf6',
  glowBlur: 0,
  mouseInteraction: true,
  frequency: 2.0,
  amplitude: 30,
  glitchIntensity: 0.3,
  seed: 42,
  direction: 'up' as any,
  transformOrigin: '50% 50%',
  
  // SVG Path Settings
  path: 'none',
  customPath: 'M 10 120 Q 150 40, 300 120 T 590 120',
  showPathOverlay: true
};

const customStyles = {
  fontSize: 4.5,
  letterSpacing: -1,
};

// Undo/Redo History Stack
const historyStack: string[] = [];
let historyIndex = -1;

function pushHistory() {
  const serialized = JSON.stringify({ state, customStyles });
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }
  historyStack.push(serialized);
  historyIndex = historyStack.length - 1;
  saveToUrl();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    applyHistoryState(historyStack[historyIndex]);
  }
}

function redo() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    applyHistoryState(historyStack[historyIndex]);
  }
}

function applyHistoryState(serialized: string) {
  try {
    const parsed = JSON.parse(serialized);
    Object.assign(state, parsed.state);
    Object.assign(customStyles, parsed.customStyles);
    
    updateInputsFromState();
    rebuildAnimation();
  } catch (e) {}
}

function saveToUrl() {
  try {
    const encoded = btoa(JSON.stringify({ state, customStyles }));
    window.location.hash = encoded;
  } catch (e) {}
}

function loadFromUrl() {
  if (window.location.hash) {
    try {
      const decoded = JSON.parse(atob(window.location.hash.substring(1)));
      if (decoded.state) Object.assign(state, decoded.state);
      if (decoded.customStyles) Object.assign(customStyles, decoded.customStyles);
    } catch (e) {}
  }
}

// ─── UI BINDINGS & SYNCS ─────────────────────────────────────────────────────

const domTarget = document.getElementById('domTarget') as HTMLElement;
const canvasWrapper = document.getElementById('canvasWrapper') as HTMLElement;
const originHandle = document.getElementById('originHandle') as HTMLElement;

const svgPathOverlay = document.getElementById('svgPathOverlay') as HTMLElement;
const svgPathLine = document.getElementById('svgPathLine') as HTMLElement;

function applyCustomStyles() {
  if (!domTarget || !canvasWrapper) return;
  
  canvasWrapper.style.backgroundColor = state.bgColor;
  domTarget.style.fontSize = `${customStyles.fontSize}rem`;
  domTarget.style.letterSpacing = `${customStyles.letterSpacing}px`;
  domTarget.style.color = state.textColor;
  
  if (state.glowBlur > 0) {
    domTarget.style.textShadow = `0 0 ${state.glowBlur}px ${state.glowColor}`;
  } else {
    domTarget.style.textShadow = 'none';
  }
  domTarget.style.transformOrigin = state.transformOrigin;
}

function buildStyleConfig() {
  const styleObj: any = {
    background: state.bgColor,
    textColor: state.textColor
  };
  
  if (state.glowBlur > 0) {
    styleObj.glow = {
      color: state.glowColor,
      radius: state.glowBlur,
      intensity: 0.8
    };
  }

  if (state.gradType !== 'none') {
    styleObj.gradient = {
      type: state.gradType,
      colors: [state.gradColor1, state.gradColor2],
      angle: state.gradAngle
    };
  }
  return styleObj;
}

function rebuildAnimation() {
  applyCustomStyles();
  updateSVGPathOverlay();
  
  Anomotion.configure({
    debug: {
      showFPS: (document.getElementById('chkShowFPS') as HTMLInputElement)?.checked || false,
      logPerformance: (document.getElementById('chkLogPerformance') as HTMLInputElement)?.checked || false
    }
  });

  const styleConfig = buildStyleConfig();
  
  // Resolve SVG Path string
  let activePathStr = 'none';
  if (state.path !== 'none') {
    if (state.path === 'custom') {
      activePathStr = state.customPath;
    } else if (state.path === 'wave') {
      activePathStr = 'M 10 120 Q 150 40, 300 120 T 590 120';
    } else if (state.path === 'circle') {
      activePathStr = 'M 300, 120 m -70, 0 a 70,70 0 1,0 140,0 a 70,70 0 1,0 -140,0';
    } else if (state.path === 'zigzag') {
      activePathStr = 'M 10 120 L 150 40 L 300 200 L 450 40 L 590 120';
    }
  }

  Anomotion.create('#domTarget', {
    text: state.text,
    effect: state.effect,
    duration: state.duration,
    stagger: state.stagger,
    easing: state.easing,
    loop: true,
    renderer: state.renderer,
    textColor: state.textColor,
    glitchColor: state.textColor,
    mouseInteraction: state.mouseInteraction,
    frequency: state.frequency,
    amplitude: state.amplitude,
    glitchIntensity: state.glitchIntensity,
    seed: state.seed,
    direction: state.direction,
    transformOrigin: state.transformOrigin,
    style: styleConfig,
    path: activePathStr
  });

  updateCodeSnippet();
  updateNodeGraphLabels();
}

function updateSVGPathOverlay() {
  if (!svgPathOverlay || !svgPathLine) return;
  
  if (state.path === 'none' || !state.showPathOverlay) {
    svgPathOverlay.style.opacity = '0';
  } else {
    svgPathOverlay.style.opacity = '1';
    let d = '';
    if (state.path === 'custom') d = state.customPath;
    else if (state.path === 'wave') d = 'M 10 120 Q 150 40, 300 120 T 590 120';
    else if (state.path === 'circle') d = 'M 300, 120 m -70, 0 a 70,70 0 1,0 140,0 a 70,70 0 1,0 -140,0';
    else if (state.path === 'zigzag') d = 'M 10 120 L 150 40 L 300 200 L 450 40 L 590 120';
    
    svgPathLine.setAttribute('d', d);
  }
}

function updateInputsFromState() {
  (document.getElementById('animText') as HTMLTextAreaElement).value = state.text;
  (document.getElementById('fontSize') as HTMLInputElement).value = String(customStyles.fontSize);
  (document.getElementById('letterSpacing') as HTMLInputElement).value = String(customStyles.letterSpacing);
  (document.getElementById('duration') as HTMLInputElement).value = String(state.duration);
  (document.getElementById('stagger') as HTMLInputElement).value = String(state.stagger);
  (document.getElementById('frequency') as HTMLInputElement).value = String(state.frequency);
  (document.getElementById('amplitude') as HTMLInputElement).value = String(state.amplitude);
  (document.getElementById('glitchIntensity') as HTMLInputElement).value = String(state.glitchIntensity);
  (document.getElementById('seed') as HTMLInputElement).value = String(state.seed);
  (document.getElementById('textColor') as HTMLInputElement).value = state.textColor;
  (document.getElementById('bgColor') as HTMLInputElement).value = state.bgColor;
  
  // Sync Gradient inputs
  const typeSelect = document.getElementById('gradType') as HTMLSelectElement;
  if (typeSelect) {
    typeSelect.value = state.gradType;
    document.getElementById('gradAngleGroup')!.style.display = state.gradType === 'linear' ? 'block' : 'none';
    document.getElementById('gradColorsGroup')!.style.display = state.gradType !== 'none' ? 'flex' : 'none';
  }
  
  (document.getElementById('gradColor1') as HTMLInputElement).value = state.gradColor1;
  (document.getElementById('gradColor2') as HTMLInputElement).value = state.gradColor2;
  (document.getElementById('gradAngle') as HTMLInputElement).value = String(state.gradAngle);
  (document.getElementById('glowColor') as HTMLInputElement).value = state.glowColor;
  (document.getElementById('glowBlur') as HTMLInputElement).value = String(state.glowBlur);
  (document.getElementById('easing') as HTMLSelectElement).value = typeof state.easing === 'string' && state.easing.startsWith('cubic-bezier') ? 'easeOutExpo' : state.easing;
  (document.getElementById('mouseInteraction') as HTMLInputElement).checked = state.mouseInteraction;

  // Sync SVG Path inputs
  (document.getElementById('svgPathSelect') as HTMLSelectElement).value = state.path;
  document.getElementById('customPathInputGroup')!.style.display = state.path === 'custom' ? 'block' : 'none';
  (document.getElementById('customPathString') as HTMLInputElement).value = state.customPath;
  (document.getElementById('chkShowPathOverlay') as HTMLInputElement).checked = state.showPathOverlay;

  document.getElementById('val-fontSize')!.textContent = `${customStyles.fontSize}rem`;
  document.getElementById('val-letterSpacing')!.textContent = `${customStyles.letterSpacing}px`;
  document.getElementById('val-duration')!.textContent = `${state.duration}s`;
  document.getElementById('val-stagger')!.textContent = `${state.stagger}ms`;
  document.getElementById('val-frequency')!.textContent = String(state.frequency);
  document.getElementById('val-amplitude')!.textContent = `${state.amplitude}px`;
  document.getElementById('val-glitchIntensity')!.textContent = String(state.glitchIntensity);
  document.getElementById('val-seed')!.textContent = String(state.seed);
  document.getElementById('val-gradAngle')!.textContent = `${state.gradAngle}°`;
  document.getElementById('val-glowBlur')!.textContent = `${state.glowBlur}px`;

  document.querySelectorAll('.segmented-btn').forEach(btn => btn.classList.remove('active'));
  const rendId = state.renderer === 'dom' ? 'btnDomRenderer' : 'btnCanvasRenderer';
  document.getElementById(rendId)?.classList.add('active');

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.toggle('active', (chip as HTMLElement).dataset.preset === state.effect);
  });

  const arrow = document.getElementById('compassArrow');
  if (arrow && typeof state.direction === 'number') {
    arrow.style.transform = `translate(-50%, -100%) rotate(${state.direction + 90}deg)`;
  }
}

// ─── PLAYBACK TIMELINE CONTROLS ──────────────────────────────────────────────

const seekSlider = document.getElementById('timelineSeek') as HTMLInputElement;
const timeDisplay = document.getElementById('timeDisplay') as HTMLSpanElement;

(window as any).onPlaybackProgress = (cur: number, total: number) => {
  const pct = (cur / (total || 1)) * 100;
  if (seekSlider) seekSlider.value = String(pct);
  if (timeDisplay) timeDisplay.textContent = cur.toFixed(2) + 's';
};

document.getElementById('btnPlayPause')?.addEventListener('click', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.paused = !a.paused;
  if (!a.paused) globalLoop.register(a);
  const icon = document.getElementById('playPauseIcon');
  if (icon) {
    icon.innerHTML = a.paused
      ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
      : '<polygon points="5 3 19 12 5 21 5 3"/>';
  }
});

document.getElementById('btnRestart')?.addEventListener('click', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.currentTime = 0;
  a.paused = false;
  globalLoop.register(a);
});

document.getElementById('btnReverse')?.addEventListener('click', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.reversed = !a.reversed;
});

seekSlider?.addEventListener('input', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.currentTime = (parseFloat(seekSlider.value) / 100) * a.options.duration;
});

// ─── VOICE REACTIVITY MIC BUTTON ─────────────────────────────────────────────

document.getElementById('btnVoiceMic')?.addEventListener('click', () => {
  const btn = document.getElementById('btnVoiceMic')!;
  btn.style.backgroundColor = '#f59e0b'; // Amber pending state
  
  Anomotion.voice.request().then(allowed => {
    if (allowed) {
      btn.style.backgroundColor = '#10b981'; // Green active state
      
      // Force preset select to bounceVoice
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      state.effect = 'bounceVoice';
      pushHistory();
      rebuildAnimation();
    } else {
      btn.style.backgroundColor = '#ef4444'; // Red failure state
      alert('Microphone access denied. Voice reactivity disabled.');
    }
  });
});

// ─── INTERACTIVE DIRECTION COMPASS WHEEL ─────────────────────────────────────

const compassWheel = document.getElementById('compassWheel') as HTMLElement;
const compassArrow = document.getElementById('compassArrow') as HTMLElement;

compassWheel?.addEventListener('click', (e) => {
  const rect = compassWheel.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  
  const angleRad = Math.atan2(dy, dx);
  let angleDeg = Math.round(angleRad * 180 / Math.PI);
  if (angleDeg < 0) angleDeg += 360;

  compassArrow.style.transform = `translate(-50%, -100%) rotate(${angleDeg + 90}deg)`;
  state.direction = angleDeg;
  
  pushHistory();
  rebuildAnimation();
});

// ─── DRAGGABLE TRANSFORM ORIGIN HANDLE ───────────────────────────────────────

let isDraggingOrigin = false;

originHandle?.addEventListener('mousedown', () => {
  isDraggingOrigin = true;
});

document.addEventListener('mousemove', (e) => {
  if (!isDraggingOrigin || !canvasWrapper) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

  originHandle.style.left = `${x - 7}px`;
  originHandle.style.top = `${y - 7}px`;

  const px = Math.round((x / rect.width) * 100);
  const py = Math.round((y / rect.height) * 100);
  state.transformOrigin = `${px}% ${py}%`;

  if (domTarget) {
    domTarget.style.transformOrigin = state.transformOrigin;
  }
});

document.addEventListener('mouseup', () => {
  if (isDraggingOrigin) {
    isDraggingOrigin = false;
    pushHistory();
    rebuildAnimation();
  }
});

// ─── PRESET CHIPS ────────────────────────────────────────────────────────────

document.querySelectorAll<HTMLElement>('.preset-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.effect = chip.dataset.preset || 'wave';
    pushHistory();
    rebuildAnimation();
  });
});

// ─── GRID OVERLAYS ───────────────────────────────────────────────────────────

const gridOverlay = document.getElementById('gridOverlay') as HTMLElement;
document.getElementById('chkGridOverlay')?.addEventListener('change', (e) => {
  gridOverlay.style.opacity = (e.target as HTMLInputElement).checked ? '1' : '0';
});

document.getElementById('chkShowOrigin')?.addEventListener('change', (e) => {
  originHandle.style.display = (e.target as HTMLInputElement).checked ? 'flex' : 'none';
});

// ─── RENDERER SWITCHER ───────────────────────────────────────────────────────

const renderers: Record<string, 'dom' | 'canvas'> = {
  btnDomRenderer: 'dom',
  btnCanvasRenderer: 'canvas'
};

Object.entries(renderers).forEach(([id, type]) => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.querySelectorAll('.segmented-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    state.renderer = type;
    pushHistory();
    rebuildAnimation();
  });
});

// ─── SLIDERS AND BINDINGS ────────────────────────────────────────────────────

function bindRange(id: string, displayId: string, suffix: string, onChange: (v: number) => void) {
  const el = document.getElementById(id) as HTMLInputElement;
  const disp = document.getElementById(displayId);
  el?.addEventListener('change', () => {
    const v = parseFloat(el.value);
    if (disp) disp.textContent = v + suffix;
    onChange(v);
    pushHistory();
    rebuildAnimation();
  });
  el?.addEventListener('input', () => {
    const v = parseFloat(el.value);
    if (disp) disp.textContent = v + suffix;
  });
}

bindRange('fontSize', 'val-fontSize', 'rem', v => { customStyles.fontSize = v; });
bindRange('letterSpacing', 'val-letterSpacing', 'px', v => { customStyles.letterSpacing = v; });
bindRange('duration', 'val-duration', 's', v => { state.duration = v; });
bindRange('stagger', 'val-stagger', 'ms', v => { state.stagger = v; });
bindRange('frequency', 'val-frequency', '', v => { state.frequency = v; });
bindRange('amplitude', 'val-amplitude', 'px', v => { state.amplitude = v; });
bindRange('glitchIntensity', 'val-glitchIntensity', '', v => { state.glitchIntensity = v; });
bindRange('seed', 'val-seed', '', v => { state.seed = v; });
bindRange('glowBlur', 'val-glowBlur', 'px', v => { state.glowBlur = v; });
bindRange('gradAngle', 'val-gradAngle', '°', v => { state.gradAngle = v; });

document.getElementById('textColor')?.addEventListener('change', (e) => {
  state.textColor = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('bgColor')?.addEventListener('change', (e) => {
  state.bgColor = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('gradType')?.addEventListener('change', (e) => {
  state.gradType = (e.target as HTMLSelectElement).value as any;
  document.getElementById('gradAngleGroup')!.style.display = state.gradType === 'linear' ? 'block' : 'none';
  document.getElementById('gradColorsGroup')!.style.display = state.gradType !== 'none' ? 'flex' : 'none';
  pushHistory();
  rebuildAnimation();
});

document.getElementById('gradColor1')?.addEventListener('change', (e) => {
  state.gradColor1 = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('gradColor2')?.addEventListener('change', (e) => {
  state.gradColor2 = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('glowColor')?.addEventListener('change', (e) => {
  state.glowColor = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('easing')?.addEventListener('change', (e) => {
  state.easing = (e.target as HTMLSelectElement).value as EasingType;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('animText')?.addEventListener('input', (e) => {
  state.text = (e.target as HTMLTextAreaElement).value;
  rebuildAnimation();
});

document.getElementById('animText')?.addEventListener('change', () => {
  pushHistory();
});

document.getElementById('mouseInteraction')?.addEventListener('change', (e) => {
  state.mouseInteraction = (e.target as HTMLInputElement).checked;
  pushHistory();
  rebuildAnimation();
});

// SVG Path Control listeners
document.getElementById('svgPathSelect')?.addEventListener('change', (e) => {
  state.path = (e.target as HTMLSelectElement).value;
  document.getElementById('customPathInputGroup')!.style.display = state.path === 'custom' ? 'block' : 'none';
  pushHistory();
  rebuildAnimation();
});

document.getElementById('customPathString')?.addEventListener('change', (e) => {
  state.customPath = (e.target as HTMLInputElement).value;
  pushHistory();
  rebuildAnimation();
});

document.getElementById('chkShowPathOverlay')?.addEventListener('change', (e) => {
  state.showPathOverlay = (e.target as HTMLInputElement).checked;
  updateSVGPathOverlay();
});

// Debug checks
document.getElementById('chkShowFPS')?.addEventListener('change', rebuildAnimation);
document.getElementById('chkLogPerformance')?.addEventListener('change', rebuildAnimation);

// ─── PLAYGROUND NODE GRAPH PIPELINE ──────────────────────────────────────────

const btnShowCode = document.getElementById('btnShowCode') as HTMLElement;
const btnShowGraph = document.getElementById('btnShowGraph') as HTMLElement;
const btnShowEasing = document.getElementById('btnShowEasing') as HTMLElement;

const codeViewContainer = document.getElementById('codeViewContainer') as HTMLElement;
const graphViewContainer = document.getElementById('graphViewContainer') as HTMLElement;
const easingViewContainer = document.getElementById('easingViewContainer') as HTMLElement;
const svgConnections = document.getElementById('graphConnections') as any;

function togglePanelViews(activeBtn: HTMLElement, activeContainer: HTMLElement) {
  [btnShowCode, btnShowGraph, btnShowEasing].forEach(btn => btn?.classList.remove('active'));
  [codeViewContainer, graphViewContainer, easingViewContainer].forEach(c => {
    if (c) c.style.display = 'none';
  });
  activeBtn.classList.add('active');
  activeContainer.style.display = activeContainer === easingViewContainer ? 'flex' : 'block';
}

btnShowCode?.addEventListener('click', () => {
  togglePanelViews(btnShowCode, codeViewContainer);
});

btnShowGraph?.addEventListener('click', () => {
  togglePanelViews(btnShowGraph, graphViewContainer);
  setTimeout(drawConnections, 50);
});

btnShowEasing?.addEventListener('click', () => {
  togglePanelViews(btnShowEasing, easingViewContainer);
  drawEasingPlot();
});

function drawConnections() {
  if (!svgConnections) return;
  svgConnections.innerHTML = '';
  
  const nodesOrder = ['node-text', 'node-split', 'node-effect', 'node-ease', 'node-renderer', 'node-custom-script'];
  for (let i = 0; i < nodesOrder.length - 1; i++) {
    const fromEl = document.getElementById(nodesOrder[i]);
    const toEl = document.getElementById(nodesOrder[i+1]);
    if (fromEl && toEl) {
      const fromPort = fromEl.querySelector('.node-port-out');
      const toPort = toEl.querySelector('.node-port-in');
      if (fromPort && toPort) {
        const fromRect = fromPort.getBoundingClientRect();
        const toRect = toPort.getBoundingClientRect();
        const svgRect = svgConnections.getBoundingClientRect();
        
        const x1 = fromRect.left - svgRect.left + 4;
        const y1 = fromRect.top - svgRect.top + 4;
        const x2 = toRect.left - svgRect.left + 4;
        const y2 = toRect.top - svgRect.top + 4;
        
        const dx = Math.abs(x2 - x1) * 0.5;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
        path.setAttribute('stroke', '#8b5cf6');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svgConnections.appendChild(path);
      }
    }
  }
}

function makeDraggable(el: HTMLElement) {
  let nx = 0, ny = 0, ox = 0, oy = 0;
  const title = el.querySelector('.node-title') as HTMLElement || el;
  title.addEventListener('mousedown', (e) => {
    ox = e.clientX;
    oy = e.clientY;
    document.onmousemove = (de) => {
      nx = ox - de.clientX;
      ny = oy - de.clientY;
      ox = de.clientX;
      oy = de.clientY;
      el.style.top = `${el.offsetTop - ny}px`;
      el.style.left = `${el.offsetLeft - nx}px`;
      drawConnections();
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  });
}

// Make all graph nodes draggable
['node-text', 'node-split', 'node-effect', 'node-ease', 'node-renderer', 'node-custom-script'].forEach(id => {
  const el = document.getElementById(id);
  if (el) makeDraggable(el);
});

function updateNodeGraphLabels() {
  const effectLbl = document.getElementById('node-effect-type');
  if (effectLbl) effectLbl.textContent = state.effect.toUpperCase();
  const easeLbl = document.getElementById('node-ease-type');
  if (easeLbl) easeLbl.textContent = String(state.easing).startsWith('cubic-bezier') ? 'Custom Bezier' : String(state.easing);
  const rendLbl = document.getElementById('node-renderer-type');
  if (rendLbl) rendLbl.textContent = state.renderer.toUpperCase();
}

window.addEventListener('resize', () => {
  drawConnections();
});

// Custom Effect Script Compiler Action
document.getElementById('btnCompileCustomEffect')?.addEventListener('click', () => {
  const codeText = (document.getElementById('customEffectCode') as HTMLTextAreaElement).value;
  try {
    const userFunc = new Function('return ' + codeText)();
    // Register custom effect in Anomotion
    Anomotion.effect.register('customScript', () => {
      return (t, i) => {
        return {
          y: userFunc(t, i)
        };
      };
    });
    state.effect = 'customScript';
    pushHistory();
    rebuildAnimation();
    
    // Highlight the presets view state
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    alert('✓ Custom effect compiled successfully and applied!');
  } catch (e: any) {
    alert('Compilation Error: ' + e.message);
  }
});

// ─── INTERACTIVE EASING PLOT CANVAS ──────────────────────────────────────────

const easingCanvas = document.getElementById('easingCurveCanvas') as HTMLCanvasElement;
const easeTypeSelect = document.getElementById('easeTypeSelect') as HTMLSelectElement;

let bezP1 = { x: 0.25, y: 0.1 };
let bezP2 = { x: 0.25, y: 1.0 };
let activeHandle: 'p1' | 'p2' | null = null;

easeTypeSelect?.addEventListener('change', () => {
  const v = easeTypeSelect.value;
  document.getElementById('springParams')!.style.display = v === 'spring' ? 'flex' : 'none';
  document.getElementById('stepsParams')!.style.display = v === 'steps' ? 'flex' : 'none';
  drawEasingPlot();
});

['springStiffness', 'springDamping', 'stepsCount'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', drawEasingPlot);
});

function drawEasingPlot() {
  if (!easingCanvas) return;
  const ctx = easingCanvas.getContext('2d')!;
  
  const w = easingCanvas.width = easingCanvas.clientWidth;
  const h = easingCanvas.height = easingCanvas.clientHeight;
  
  ctx.clearRect(0, 0, w, h);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const padding = 40;
  const graphW = w - padding * 2;
  const graphH = h - padding * 2;
  
  const toCanvas = (px: number, py: number) => ({
    x: padding + px * graphW,
    y: h - padding - py * graphH
  });

  const startPt = toCanvas(0, 0);
  const endPt = toCanvas(1, 1);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(startPt.x, startPt.y);
  ctx.lineTo(endPt.x, startPt.y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(endPt.x, startPt.y);
  ctx.lineTo(endPt.x, endPt.y);
  ctx.stroke();

  const easeMode = easeTypeSelect.value;

  if (easeMode === 'bezier') {
    const c1 = toCanvas(bezP1.x, bezP1.y);
    const c2 = toCanvas(bezP2.x, bezP2.y);
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(startPt.x, startPt.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endPt.x, endPt.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    for (let t = 0; t <= 1; t += 0.01) {
      const x = 3 * (1 - t) * (1 - t) * t * bezP1.x + 3 * (1 - t) * t * t * bezP2.x + t * t * t;
      const y = 3 * (1 - t) * (1 - t) * t * bezP1.y + 3 * (1 - t) * t * t * bezP2.y + t * t * t;
      const canvasPos = toCanvas(x, y);
      ctx.lineTo(canvasPos.x, canvasPos.y);
    }
    ctx.stroke();

    ctx.fillStyle = '#a78bfa';
    ctx.beginPath(); ctx.arc(c1.x, c1.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(c2.x, c2.y, 6, 0, Math.PI * 2); ctx.fill();
  } 
  else if (easeMode === 'spring') {
    const stiff = parseFloat((document.getElementById('springStiffness') as HTMLInputElement).value);
    const damp = parseFloat((document.getElementById('springDamping') as HTMLInputElement).value);
    
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);

    let x = -1.0;
    let v = 0.0;
    const steps = 100;
    const dt = 1.0 / steps;

    for (let i = 0; i <= steps; i++) {
      const px = i / steps;
      const py = x + 1.0;
      const canvasPos = toCanvas(px, py);
      ctx.lineTo(canvasPos.x, canvasPos.y);

      const f = (tx: number, tv: number) => tv;
      const g = (tx: number, tv: number) => (-stiff * tx - damp * tv);
      
      const k1x = f(x, v);
      const k1v = g(x, v);
      
      const k2x = f(x + 0.5 * dt * k1x, v + 0.5 * dt * k1v);
      const k2v = g(x + 0.5 * dt * k1x, v + 0.5 * dt * k1v);
      
      const k3x = f(x + 0.5 * dt * k2x, v + 0.5 * dt * k2v);
      const k3v = g(x + 0.5 * dt * k2x, v + 0.5 * dt * k2v);
      
      const k4x = f(x + dt * k3x, v + dt * k3v);
      const k4v = g(x + dt * k3x, v + dt * k3v);
      
      x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    }
    ctx.stroke();
  }
  else if (easeMode === 'steps') {
    const count = parseInt((document.getElementById('stepsCount') as HTMLInputElement).value);
    
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    
    for (let i = 0; i < count; i++) {
      const tStart = i / count;
      const tEnd = (i + 1) / count;
      const py = (i + 1) / count;
      
      const pStart = toCanvas(tStart, py);
      const pEnd = toCanvas(tEnd, py);
      
      ctx.lineTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
    }
    ctx.stroke();
  }
}

easingCanvas?.addEventListener('mousedown', (e) => {
  if (easeTypeSelect.value !== 'bezier') return;
  const rect = easingCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const padding = 40;
  const graphW = easingCanvas.width - padding * 2;
  const graphH = easingCanvas.height - padding * 2;
  
  const toCanvas = (px: number, py: number) => ({
    x: padding + px * graphW,
    y: easingCanvas.height - padding - py * graphH
  });

  const c1 = toCanvas(bezP1.x, bezP1.y);
  const c2 = toCanvas(bezP2.x, bezP2.y);

  const d1 = Math.sqrt((mx - c1.x) ** 2 + (my - c1.y) ** 2);
  const d2 = Math.sqrt((mx - c2.x) ** 2 + (my - c2.y) ** 2);

  if (d1 < 15) activeHandle = 'p1';
  else if (d2 < 15) activeHandle = 'p2';
});

document.addEventListener('mousemove', (e) => {
  if (!activeHandle || !easingCanvas) return;
  const rect = easingCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const padding = 40;
  const graphW = easingCanvas.width - padding * 2;
  const graphH = easingCanvas.height - padding * 2;

  const coords = {
    x: Math.max(0, Math.min(1, (mx - padding) / graphW)),
    y: Math.max(-0.5, Math.min(1.5, (easingCanvas.height - padding - my) / graphH))
  };

  if (activeHandle === 'p1') {
    bezP1 = coords;
  } else {
    bezP2 = coords;
  }
  drawEasingPlot();
});

document.addEventListener('mouseup', () => {
  if (activeHandle) {
    activeHandle = null;
  }
});

document.getElementById('btnApplyEasing')?.addEventListener('click', () => {
  const model = easeTypeSelect.value;
  let computedEase = 'easeOutExpo';
  
  if (model === 'bezier') {
    computedEase = `cubic-bezier(${bezP1.x.toFixed(2)}, ${bezP1.y.toFixed(2)}, ${bezP2.x.toFixed(2)}, ${bezP2.y.toFixed(2)})`;
  } else if (model === 'spring') {
    const stiff = (document.getElementById('springStiffness') as HTMLInputElement).value;
    const damp = (document.getElementById('springDamping') as HTMLInputElement).value;
    computedEase = `spring({ mass: 1, stiffness: ${stiff}, damping: ${damp} })`;
  } else {
    const count = (document.getElementById('stepsCount') as HTMLInputElement).value;
    computedEase = `steps(${count}, end)`;
  }
  
  state.easing = computedEase;
  pushHistory();
  rebuildAnimation();
  
  togglePanelViews(btnShowCode, codeViewContainer);
});

// ─── BLUEPRINT CODE GENERATION ───────────────────────────────────────────────

const snippets: Record<string, () => string> = {
  vanilla: () => {
    const styleBlock = buildStyleConfig();
    return `import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.2';
import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.2';

Anomotion.create('#target', {
  text: '${state.text}',
  effect: '${state.effect}',
  duration: ${state.duration},
  stagger: ${state.stagger},
  easing: '${state.easing}',
  renderer: '${state.renderer}',
  textColor: '${state.textColor}',
  direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
  transformOrigin: '${state.transformOrigin}',
  loop: true,
  style: ${JSON.stringify(styleBlock, null, 2)}
});`;
  },

  react: () => {
    const styleBlock = buildStyleConfig();
    return `import { useEffect, useRef } from 'react';
import { useAnomotion } from 'https://esm.sh/@eldrex/anomotionjs-plugins@1.0.2';

export function AnimatedText() {
  const ref = useRef<HTMLDivElement>(null);
  
  useAnomotion(ref, {
    text: '${state.text}',
    effect: '${state.effect}',
    duration: ${state.duration},
    stagger: ${state.stagger},
    easing: '${state.easing}',
    renderer: '${state.renderer}',
    textColor: '${state.textColor}',
    direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
    transformOrigin: '${state.transformOrigin}',
    loop: true,
    style: ${JSON.stringify(styleBlock, null, 2)}
  });

  return <div ref={ref} />;
}`;
  },

  vue: () => {
    const styleBlock = buildStyleConfig();
    return `<template>
  <div ref="target" />
</template>

<script setup>
import { ref } from 'vue';
import { useAnomotionVue } from 'https://esm.sh/@eldrex/anomotionjs-plugins@1.0.2';

const target = ref(null);
const { destroy } = useAnomotionVue(target, {
  text: '${state.text}',
  effect: '${state.effect}',
  duration: ${state.duration},
  stagger: ${state.stagger},
  easing: '${state.easing}',
  renderer: '${state.renderer}',
  textColor: '${state.textColor}',
  direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
  transformOrigin: '${state.transformOrigin}',
  loop: true,
  style: ${JSON.stringify(styleBlock, null, 2)}
});
</script>`;
  },

  svelte: () => {
    const styleBlock = buildStyleConfig();
    return `<script>
  import { anomotionAction } from 'https://esm.sh/@eldrex/anomotionjs-plugins@1.0.2';
</script>

<div use:anomotionAction={{
  text: '${state.text}',
  effect: '${state.effect}',
  duration: ${state.duration},
  stagger: ${state.stagger},
  easing: '${state.easing}',
  renderer: '${state.renderer}',
  textColor: '${state.textColor}',
  direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
  transformOrigin: '${state.transformOrigin}',
  loop: true,
  style: ${JSON.stringify(styleBlock, null, 2)}
}} />`;
  },

  cdn: () => {
    const styleBlock = buildStyleConfig();
    return `<div id="target">${state.text}</div>

<script type="module">
  import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.2';
  import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.2';

  Anomotion.create('#target', {
    text: '${state.text}',
    effect: '${state.effect}',
    duration: ${state.duration},
    stagger: ${state.stagger},
    easing: '${state.easing}',
    renderer: '${state.renderer}',
    textColor: '${state.textColor}',
    direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
    transformOrigin: '${state.transformOrigin}',
    loop: true,
    style: ${JSON.stringify(styleBlock, null, 2)}
  });
</script>`;
  },
};

function updateCodeSnippet() {
  const fw = (document.getElementById('exportFramework') as HTMLSelectElement)?.value || 'vanilla';
  const code = document.getElementById('codeSnippet');
  if (code) code.textContent = snippets[fw]?.() || '';
}

document.getElementById('exportFramework')?.addEventListener('change', updateCodeSnippet);

// Copy Code Button
document.getElementById('btnCopyCode')?.addEventListener('click', () => {
  const snippet = document.getElementById('codeSnippet')?.textContent || '';
  navigator.clipboard.writeText(snippet).then(() => {
    const btn = document.getElementById('btnCopyCode')!;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
});

// WYSIWYG Standalone HTML Download Exporter
document.getElementById('btnDownloadHtml')?.addEventListener('click', () => {
  const styleBlock = buildStyleConfig();
  const cdnSnippet = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AnomotionJS Standalone Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: ${state.bgColor};
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
      font-family: 'Outfit', sans-serif;
    }
    #target {
      font-size: ${customStyles.fontSize}rem;
      letter-spacing: ${customStyles.letterSpacing}px;
      color: ${state.textColor};
      text-align: center;
      ${state.glowBlur > 0 ? `text-shadow: 0 0 ${state.glowBlur}px ${state.glowColor};` : ''}
    }
  </style>
</head>
<body>
  <div id="target">${state.text}</div>
  <span style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.25);">
    Output matches preview exactly — copy and run anywhere.
  </span>

  <script type="module">
    import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.2';
    import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.2';

    Anomotion.create('#target', {
      text: '${state.text}',
      effect: '${state.effect}',
      duration: ${state.duration},
      stagger: ${state.stagger},
      easing: '${state.easing}',
      renderer: '${state.renderer}',
      textColor: '${state.textColor}',
      direction: ${typeof state.direction === 'number' ? state.direction : `'${state.direction}'`},
      transformOrigin: '${state.transformOrigin}',
      loop: true,
      style: ${JSON.stringify(styleBlock, null, 2)}
    });
  </script>
</body>
</html>`;

  const blob = new Blob([cdnSnippet], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anomotion-preview.html';
  a.click();
});

// Keyboard listener for undo/redo (Ctrl+Z / Ctrl+Y)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  } else if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    redo();
  }
});

// ─── INITIALIZATION ──────────────────────────────────────────────────────────

loadFromUrl();
updateInputsFromState();
rebuildAnimation();
pushHistory();
