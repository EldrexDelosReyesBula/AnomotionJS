/**
 * AnomotionJS Playground — Self-Contained Bundle
 * All core + renderer logic inlined. Zero external package dependencies.
 */

// ─── CORE TYPES ──────────────────────────────────────────────────────────────

type EasingType = 'linear' | 'easeOutElastic' | 'easeInOutQuad' | 'easeOutBounce' | 'easeOutBack';

interface GlyphState {
  originalX: number; originalY: number; x: number; y: number;
  scaleX: number; scaleY: number; rotation: number; opacity: number;
  color?: string; filter?: string;
}

interface AnimationOptions {
  effect?: string; duration?: number; stagger?: number;
  easing?: EasingType; loop?: boolean; text?: string;
  renderer?: 'dom' | 'canvas'; textColor?: string; glitchColor?: string;
  customEquation?: string | ((t: number, i: number) => number);
  mouseInteraction?: boolean; frequency?: number; amplitude?: number;
}

interface Renderer {
  container?: HTMLElement; glyphs: any[];
  mount(text: string): void;
  render(states: GlyphState[]): number;
  dispose(): void;
}

// ─── EASING ──────────────────────────────────────────────────────────────────

const Easing: Record<EasingType, (t: number) => number> = {
  linear: t => t,
  easeOutElastic: t => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
};

// ─── DOM RENDERER ────────────────────────────────────────────────────────────

class DomRenderer implements Renderer {
  container: HTMLElement;
  glyphs: { element: HTMLSpanElement; char: string }[] = [];

  constructor(container: HTMLElement) { this.container = container; }

  mount(text: string): void {
    this.container.innerHTML = '';
    this.glyphs = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      this.container.appendChild(span);
      return { element: span, char };
    });
  }

  render(states: GlyphState[]): number {
    const t0 = performance.now();
    for (let i = 0; i < this.glyphs.length; i++) {
      const { element } = this.glyphs[i];
      const s = states[i];
      if (!s) continue;
      element.style.transform = `translate3d(${s.x}px,${s.y}px,0) rotate(${s.rotation}deg) scale(${s.scaleX},${s.scaleY})`;
      element.style.opacity = String(s.opacity);
      if (s.color) element.style.color = s.color;
      if (s.filter) element.style.filter = s.filter;
    }
    return performance.now() - t0;
  }

  dispose(): void { this.container.innerHTML = ''; }
}

// ─── CANVAS 2D RENDERER ──────────────────────────────────────────────────────

class Canvas2DRenderer implements Renderer {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  glyphs: { char: string }[] = [];
  private w = 0; private h = 0;
  private currentColor = '#ffffff';

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  mount(text: string): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.resize();
    this.glyphs = text.split('').map(char => ({ char }));
  }

  resize(): void {
    const r = this.container.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.h + 'px';
    this.ctx.scale(dpr, dpr);
  }

  render(states: GlyphState[]): number {
    const t0 = performance.now();
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.font = '800 4rem "Outfit", sans-serif';
    this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
    const textStr = this.glyphs.map(g => g.char).join('');
    const totalW = this.ctx.measureText(textStr).width;
    let curX = (this.w - totalW) / 2;
    for (let i = 0; i < this.glyphs.length; i++) {
      const g = this.glyphs[i]; const s = states[i];
      if (!s) continue;
      const cw = this.ctx.measureText(g.char).width;
      this.ctx.save();
      this.ctx.translate(curX + cw / 2 + s.x, this.h / 2 + s.y);
      this.ctx.scale(s.scaleX, s.scaleY);
      this.ctx.rotate(s.rotation * Math.PI / 180);
      this.ctx.globalAlpha = s.opacity;
      this.ctx.fillStyle = s.color || this.currentColor;
      this.ctx.fillText(g.char, 0, 0);
      this.ctx.restore();
      curX += cw;
    }
    return performance.now() - t0;
  }

  setColor(c: string) { this.currentColor = c; }
  dispose(): void { this.canvas.remove(); this.container.innerHTML = ''; }
}

// ─── ANIMATION LOOP ──────────────────────────────────────────────────────────

class AnimationLoop {
  private anims = new Set<TextAnimation>();
  private running = false;

  add(a: TextAnimation) {
    this.anims.add(a);
    if (!this.running) { this.running = true; requestAnimationFrame(t => this.tick(t)); }
  }

  remove(a: TextAnimation) {
    this.anims.delete(a);
    if (this.anims.size === 0) this.running = false;
  }

  private tick(t: number) {
    if (!this.running) return;
    for (const a of this.anims) { const done = a.update(t); if (done) this.remove(a); }
    requestAnimationFrame(ts => this.tick(ts));
  }
}

const globalLoop = new AnimationLoop();

// ─── TEXT ANIMATION ──────────────────────────────────────────────────────────

class TextAnimation {
  renderer: Renderer;
  options: Required<AnimationOptions>;
  private startTime = 0;
  states: GlyphState[] = [];
  paused = false;
  reversed = false;
  currentTime = 0;
  private mouseX = -9999; private mouseY = -9999;
  private mmHandler: any = null; private mlHandler: any = null;

  constructor(renderer: Renderer, options: AnimationOptions = {}) {
    this.renderer = renderer;
    this.options = {
      effect: options.effect || 'wave', duration: options.duration ?? 1.8,
      stagger: options.stagger ?? 50, easing: options.easing || 'easeOutElastic',
      loop: options.loop ?? true, text: options.text || '',
      renderer: options.renderer || 'dom', textColor: options.textColor || '#ffffff',
      glitchColor: options.glitchColor || '#ff0055',
      customEquation: options.customEquation || '',
      mouseInteraction: options.mouseInteraction ?? true,
      frequency: options.frequency ?? 2.0, amplitude: options.amplitude ?? 30
    } as any;
    this.initStates();
    this.initMouse();
  }

  private initStates() {
    this.states = this.renderer.glyphs.map(() =>
      ({ originalX: 0, originalY: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 }));
  }

  private initMouse() {
    if (!this.renderer.container || !this.options.mouseInteraction) return;
    const c = this.renderer.container;
    this.mmHandler = (e: MouseEvent) => { const r = c.getBoundingClientRect(); this.mouseX = e.clientX - r.left; this.mouseY = e.clientY - r.top; };
    this.mlHandler = () => { this.mouseX = -9999; this.mouseY = -9999; };
    c.addEventListener('mousemove', this.mmHandler);
    c.addEventListener('mouseleave', this.mlHandler);
  }

  private cleanupMouse() {
    if (this.renderer.container && this.mmHandler) {
      this.renderer.container.removeEventListener('mousemove', this.mmHandler);
      this.renderer.container.removeEventListener('mouseleave', this.mlHandler);
    }
  }

  update(time: number): boolean {
    if (this.paused) return false;
    if (!this.startTime) this.startTime = time;
    const diff = (time - this.startTime) / 1000;
    this.startTime = time;

    if (this.reversed) {
      this.currentTime = Math.max(0, this.currentTime - diff);
      if (this.currentTime <= 0 && this.options.loop) this.currentTime = this.options.duration;
    } else {
      this.currentTime += diff;
      if (this.currentTime >= this.options.duration) {
        if (this.options.loop) this.currentTime = 0;
        else this.currentTime = this.options.duration;
      }
    }

    if ((window as any).onPlaybackProgress)
      (window as any).onPlaybackProgress(this.currentTime, this.options.duration);

    const { duration, easing, frequency: freq, amplitude: amp } = this.options;
    const easeFunc = Easing[easing] || Easing.linear;

    let customFn: ((t: number, i: number) => number) | null = null;
    if (this.options.customEquation) {
      const eq = this.options.customEquation;
      if (typeof eq === 'function') customFn = eq;
      else if (typeof eq === 'string' && eq.trim()) {
        try { customFn = new Function('t', 'i', `return ${eq};`) as any; } catch { /* ignore */ }
      }
    }

    for (let i = 0; i < this.states.length; i++) {
      const s = this.states[i];
      const delay = (i * this.options.stagger) / 1000;
      let prog = Math.max(0, this.currentTime - delay) / (duration - delay);
      if (prog > 1) prog = this.options.loop ? prog % 1.0 : 1;
      const t = easeFunc(prog);

      s.originalX = 0; s.originalY = 0; s.scaleX = 1; s.scaleY = 1;
      s.rotation = 0; s.opacity = 1; s.color = this.options.textColor || undefined;

      if (customFn) {
        try { s.originalY = customFn(t, i); } catch { /* ignore */ }
      } else {
        switch (this.options.effect) {
          case 'wave':
            s.originalY = Math.sin(t * Math.PI * freq) * -amp;
            s.scaleX = 1 + Math.sin(t * Math.PI * freq) * 0.15;
            s.scaleY = 1 + Math.cos(t * Math.PI * freq) * 0.15;
            break;
          case 'glitch':
            const g = Math.random() > 0.85;
            s.originalX = g ? (Math.random() - 0.5) * 15 : 0;
            s.originalY = g ? (Math.random() - 0.5) * 6 : 0;
            s.scaleX = g ? 1.3 : 1; s.opacity = g ? 0.8 : 1;
            if (g && this.options.glitchColor) s.color = this.options.glitchColor;
            break;
          case 'reveal':
            s.originalY = (1 - t) * 50; s.opacity = t; break;
          case 'explode':
            const px = 1 - t;
            s.originalX = (i - this.states.length / 2) * px * (amp * 1.5);
            s.originalY = Math.sin(i) * px * (amp * 2);
            s.scaleX = s.scaleY = t; s.opacity = t; break;
          case 'float':
            s.originalY = Math.sin(t * Math.PI * freq + i * 0.5) * amp;
            s.rotation = Math.cos(t * Math.PI * freq + i * 0.3) * 5; break;
          case 'vortex':
            const va = t * Math.PI * freq + i * 0.5, vr = (1 - t) * amp * 2.5;
            s.originalX = Math.cos(va) * vr; s.originalY = Math.sin(va) * vr;
            s.opacity = t; s.rotation = t * 360; break;
          case 'distortion': case 'distort':
            s.originalX = Math.sin(t * Math.PI * freq + i) * (amp / 3);
            s.originalY = Math.cos(t * Math.PI * freq) * (amp * 0.67);
            s.rotation = Math.sin(t * Math.PI) * 45; break;
          case 'spiral':
            const sa = t * Math.PI * freq + i * 0.5, sr = (1 - t) * amp * 3;
            s.originalX = Math.cos(sa) * sr; s.originalY = Math.sin(sa) * sr;
            s.scaleX = s.scaleY = t; break;
          case 'morph':
            s.scaleX = 1 + Math.sin(t * Math.PI * freq) * 0.8;
            s.scaleY = 1 + Math.cos(t * Math.PI * freq) * 0.8;
            s.rotation = t * 180; break;
        }
      }

      s.x = s.originalX; s.y = s.originalY;

      if (this.options.mouseInteraction && this.mouseX !== -9999 && this.renderer.container) {
        const cw = 24, total = this.states.length * cw;
        const cWidth = this.renderer.container.clientWidth || 800;
        const cHeight = this.renderer.container.clientHeight || 200;
        const gx = (cWidth - total) / 2 + i * cw + cw / 2;
        const gy = cHeight / 2;
        const dx = this.mouseX - gx, dy = this.mouseY - gy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          const ang = Math.atan2(dy, dx);
          s.x += Math.cos(ang) * force * -40;
          s.y += Math.sin(ang) * force * -40;
          s.rotation += Math.sin(ang) * force * 30;
        }
      }
    }

    this.renderer.render(this.states);
    return this.currentTime >= duration && !this.options.loop;
  }

  destroy() {
    this.cleanupMouse();
    this.renderer.dispose();
  }
}

// ─── ANOMOTION FACADE ────────────────────────────────────────────────────────

const Anomotion = {
  activeInstance: null as TextAnimation | null,
  renderers: new Map<string, any>([
    ['dom', DomRenderer],
    ['canvas', Canvas2DRenderer],
  ]),

  create(selector: string | HTMLElement, options: AnimationOptions = {}) {
    const container = typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : selector;
    if (!container) return null;
    if ((container as any)._anomotion) (container as any)._anomotion.destroy();
    const RendClass = this.renderers.get(options.renderer || 'dom');
    if (!RendClass) return null;
    const rend = new RendClass(container);
    rend.mount(options.text || container.textContent || '');
    const anim = new TextAnimation(rend, options);
    (container as any)._anomotion = anim;
    globalLoop.add(anim);
    this.activeInstance = anim;
    return anim;
  }
};

// ─── PLAYGROUND STATE ────────────────────────────────────────────────────────

const state = {
  text: 'ANOMOTION MONOREPO', effect: 'wave', duration: 1.8,
  stagger: 50, easing: 'easeOutElastic' as EasingType,
  renderer: 'dom' as 'dom' | 'canvas', textColor: '#ffffff',
  glitchColor: '#ff0055', mouseInteraction: true,
  customEquation: '', frequency: 2.0, amplitude: 30,
};

const customStyles = { fontSize: 4.5, letterSpacing: -1, glowColor: '#0070f3', glowBlur: 0 };

const domTarget = document.getElementById('domTarget') as HTMLElement;

function applyCustomStyles() {
  if (!domTarget) return;
  domTarget.style.fontSize = `${customStyles.fontSize}rem`;
  domTarget.style.letterSpacing = `${customStyles.letterSpacing}px`;
  domTarget.style.color = state.textColor;
  domTarget.style.textShadow = customStyles.glowBlur > 0
    ? `0 0 ${customStyles.glowBlur}px ${customStyles.glowColor}` : 'none';
}

function rebuildAnimation() {
  applyCustomStyles();
  Anomotion.create('#domTarget', {
    text: state.text, effect: state.effect, duration: state.duration,
    stagger: state.stagger, easing: state.easing, loop: true,
    renderer: state.renderer, textColor: state.textColor,
    glitchColor: state.glitchColor, mouseInteraction: state.mouseInteraction,
    customEquation: state.customEquation, frequency: state.frequency,
    amplitude: state.amplitude,
  });
  updateCodeSnippet();
}

// ─── PLAYBACK CONTROLS ───────────────────────────────────────────────────────

const seekSlider = document.getElementById('timelineSeek') as HTMLInputElement;
const timeDisplay = document.getElementById('timeDisplay') as HTMLSpanElement;

(window as any).onPlaybackProgress = (cur: number, total: number) => {
  const pct = (cur / total) * 100;
  seekSlider.value = String(pct);
  timeDisplay.textContent = cur.toFixed(2) + 's';
};

document.getElementById('btnPlayPause')?.addEventListener('click', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.paused = !a.paused;
  if (!a.paused) globalLoop.add(a);
  const icon = document.getElementById('playPauseIcon');
  if (icon) icon.innerHTML = a.paused
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5 3 19 12 5 21 5 3"/>';
});

document.getElementById('btnRestart')?.addEventListener('click', () => {
  const a = Anomotion.activeInstance;
  if (!a) return;
  a.currentTime = 0; a.paused = false; globalLoop.add(a);
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

// ─── PRESET CHIPS ────────────────────────────────────────────────────────────

document.querySelectorAll<HTMLElement>('.preset-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.effect = chip.dataset.preset || 'wave';
    rebuildAnimation();
  });
});

// ─── RENDERER SWITCHER ───────────────────────────────────────────────────────

const rendererBtns: [string, 'dom' | 'canvas'][] = [
  ['btnDomRenderer', 'dom'], ['btnCanvasRenderer', 'canvas'],
  ['btnThreeRenderer', 'dom'], ['btnWebGpuRenderer', 'dom'],
];

rendererBtns.forEach(([id, r]) => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    state.renderer = r;
    rebuildAnimation();
  });
});

// ─── RANGE INPUTS ────────────────────────────────────────────────────────────

function bindRange(id: string, displayId: string, suffix: string, onChange: (v: number) => void) {
  const el = document.getElementById(id) as HTMLInputElement;
  const disp = document.getElementById(displayId);
  el?.addEventListener('input', () => {
    const v = parseFloat(el.value);
    if (disp) disp.textContent = v + suffix;
    onChange(v);
    rebuildAnimation();
  });
}

bindRange('frequency', 'val-frequency', '', v => { state.frequency = v; });
bindRange('amplitude', 'val-amplitude', 'px', v => { state.amplitude = v; });
bindRange('fontSize', 'val-fontSize', 'rem', v => { customStyles.fontSize = v; });
bindRange('letterSpacing', 'val-letterSpacing', 'px', v => { customStyles.letterSpacing = v; });
bindRange('glowBlur', 'val-glowBlur', 'px', v => { customStyles.glowBlur = v; });
bindRange('duration', 'val-duration', 's', v => { state.duration = v; });
bindRange('stagger', 'val-stagger', 'ms', v => { state.stagger = v; });

// ─── COLOR INPUTS ────────────────────────────────────────────────────────────

document.getElementById('textColor')?.addEventListener('input', (e) => {
  state.textColor = (e.target as HTMLInputElement).value;
  rebuildAnimation();
});

document.getElementById('glowColor')?.addEventListener('input', (e) => {
  customStyles.glowColor = (e.target as HTMLInputElement).value;
  applyCustomStyles();
});

document.getElementById('glitchColor')?.addEventListener('input', (e) => {
  state.glitchColor = (e.target as HTMLInputElement).value;
  rebuildAnimation();
});

// ─── OTHER CONTROLS ──────────────────────────────────────────────────────────

document.getElementById('easing')?.addEventListener('change', (e) => {
  state.easing = (e.target as HTMLSelectElement).value as EasingType;
  rebuildAnimation();
});

document.getElementById('animText')?.addEventListener('input', (e) => {
  state.text = (e.target as HTMLTextAreaElement).value;
  rebuildAnimation();
});

document.getElementById('customEq')?.addEventListener('input', (e) => {
  state.customEquation = (e.target as HTMLTextAreaElement).value;
  rebuildAnimation();
});

document.getElementById('mouseInteraction')?.addEventListener('change', (e) => {
  state.mouseInteraction = (e.target as HTMLInputElement).checked;
  rebuildAnimation();
});

// ─── CODE EXPORT ─────────────────────────────────────────────────────────────

const snippets: Record<string, () => string> = {
  vanilla: () => `import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

Anomotion.create('#target', {
  text: '${state.text}',
  effect: '${state.effect}',
  duration: ${state.duration},
  stagger: ${state.stagger},
  easing: '${state.easing}',
  renderer: '${state.renderer}',
  textColor: '${state.textColor}',
  loop: true,
});`,

  react: () => `import { useEffect, useRef } from 'react';
import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

export function AnimatedText() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const anim = Anomotion.create(ref.current, {
      text: '${state.text}',
      effect: '${state.effect}',
      duration: ${state.duration},
      stagger: ${state.stagger},
      easing: '${state.easing}',
      renderer: '${state.renderer}',
      textColor: '${state.textColor}',
      loop: true,
    });
    return () => anim?.destroy();
  }, []);

  return <div ref={ref} />;
}`,

  vue: () => `<template>
  <div ref="target" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

const target = ref(null);
let anim;

onMounted(() => {
  anim = Anomotion.create(target.value, {
    text: '${state.text}',
    effect: '${state.effect}',
    duration: ${state.duration},
    stagger: ${state.stagger},
    easing: '${state.easing}',
    renderer: '${state.renderer}',
    textColor: '${state.textColor}',
    loop: true,
  });
});

onUnmounted(() => anim?.destroy());
</script>`,

  svelte: () => `<script>
  import { onMount, onDestroy } from 'svelte';
  import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
  import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

  let el, anim;
  onMount(() => {
    anim = Anomotion.create(el, {
      text: '${state.text}',
      effect: '${state.effect}',
      duration: ${state.duration},
      stagger: ${state.stagger},
      easing: '${state.easing}',
      renderer: '${state.renderer}',
      textColor: '${state.textColor}',
      loop: true,
    });
  });
  onDestroy(() => anim?.destroy());
</script>

<div bind:this={el} />`,

  cdn: () => `<div id="target">${state.text}</div>

<script type="module">
  import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
  import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

  Anomotion.create('#target', {
    text: '${state.text}',
    effect: '${state.effect}',
    duration: ${state.duration},
    stagger: ${state.stagger},
    easing: '${state.easing}',
    renderer: '${state.renderer}',
    textColor: '${state.textColor}',
    loop: true,
  });
</script>`,
};

function updateCodeSnippet() {
  const fw = (document.getElementById('exportFramework') as HTMLSelectElement)?.value || 'vanilla';
  const code = document.getElementById('codeSnippet');
  if (code) code.textContent = snippets[fw]?.() || '';
}

document.getElementById('exportFramework')?.addEventListener('change', updateCodeSnippet);

// ─── INIT ────────────────────────────────────────────────────────────────────

rebuildAnimation();
