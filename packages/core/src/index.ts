export type EasingType = 
  | 'linear' 
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
  | 'anticipate'
  | string;

export const Easing: Record<string, (t: number) => number> = {
  linear: t => t,
  
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - (--t) * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 + (--t) * t * t * t * t,
  easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: t => Math.sin((t * Math.PI) / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  
  easeInCirc: t => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: t => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - 4 * (--t) * t) + 1) / 2,
  
  easeInElastic: t => {
    if (t === 0) return 0; if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
  },
  easeOutElastic: t => {
    if (t === 0) return 0; if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  easeInOutElastic: t => {
    if (t === 0) return 0; if (t === 1) return 1;
    const c2 = (2 * Math.PI) / 4.5;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c2)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c2)) / 2 + 1;
  },
  
  easeInBack: t => {
    const c1 = 1.70158;
    return (c1 + 1) * t * t * t - c1 * t * t;
  },
  easeOutBack: t => {
    const c1 = 1.70158;
    return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: t => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  
  easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: t => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: t => t < 0.5 ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2 : (Easing.easeOutBounce(2 * t - 1) + 1) / 2,

  anticipate: t => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    t *= 2;
    if (t < 1) return 0.5 * (t * t * ((c2 + 1) * t - c2));
    t -= 2;
    return 0.5 * (t * t * ((c2 + 1) * t + c2) + 2);
  }
};

// RK4 Spring Solver
export function solveSpringRK4(mass: number, stiffness: number, damping: number): (t: number) => number {
  const steps = 150;
  const dt = 1.0 / steps;
  const pos: number[] = [];
  
  let x = -1.0;
  let v = 0.0;
  
  for (let i = 0; i <= steps; i++) {
    pos.push(x + 1.0);
    
    const f = (tx: number, tv: number) => tv;
    const g = (tx: number, tv: number) => (-stiffness * tx - damping * tv) / mass;
    
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
  
  return (t: number) => {
    const idx = Math.min(steps, Math.floor(t * steps));
    return pos[idx];
  };
}

// Cubic Bézier Solver
export function solveCubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const getX = (t: number) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const getY = (t: number) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  const getDerivativeX = (t: number) => 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
  
  return (x: number) => {
    if (x === 0) return 0;
    if (x === 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const currentX = getX(t) - x;
      const dX = getDerivativeX(t);
      if (Math.abs(dX) < 1e-6) break;
      t -= currentX / dX;
    }
    return getY(t);
  };
}

// Step Easing Quantizer
export function solveSteps(count: number, direction: 'start' | 'end' = 'end'): (t: number) => number {
  return (t: number) => {
    if (t >= 1) return 1;
    const step = Math.floor(t * count);
    return (direction === 'start' ? step + 1 : step) / count;
  };
}

export interface GlyphState {
  originalX: number;
  originalY: number;
  originalZ?: number;
  x: number;
  y: number;
  z?: number;
  scaleX: number;
  scaleY: number;
  scaleZ?: number;
  rotation: number;
  rotationY?: number;
  rotationZ?: number;
  opacity: number;
  filter?: string;
  color?: string;
  char?: string;
}

export interface ShadowStyle {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface GlowStyle {
  color: string;
  radius: number;
  intensity: number;
}

export interface GradientStyle {
  type: 'linear' | 'radial' | 'conic';
  colors: string[];
  angle?: number;
  stops?: { offset: number; color: string }[];
}

export interface ContainerStyle {
  background?: string;
  textColor?: string;
  shadow?: ShadowStyle;
  glow?: GlowStyle;
  gradient?: GradientStyle;
}

export interface AnimationOptions {
  effect?: string;
  duration?: number;
  stagger?: number | 'random' | { from: 'center' | 'edges' | 'left' | 'right' };
  easing?: EasingType;
  loop?: boolean | number | 'pingpong';
  physics?: boolean;
  text?: string;
  renderer?: 'dom' | 'canvas' | 'three' | 'webgpu' | 'auto';
  textColor?: string;
  glitchColor?: string;
  customEquation?: string | ((t: number, i: number) => number);
  mouseInteraction?: boolean;
  frequency?: number;
  amplitude?: number;
  style?: ContainerStyle;
  path?: string;
  scrollTrigger?: boolean;
  
  // v1.0.2 Parameters
  depth?: number;
  bevelThickness?: number;
  bevelSegments?: number;
  extrudeEasing?: EasingType;
  axis?: 'x' | 'y' | 'z';
  perChar?: boolean;
  rotationSpeed?: number;
  explosionForce?: number;
  gravity?: number;
  scatterRadius?: number;
  reassemblyDelay?: number;
  foldAxis?: 'top' | 'bottom' | 'left' | 'right';
  foldAngle?: number;
  creaseColor?: string;
  orbitSpeed?: number;
  autoRotate?: boolean;
  cameraDistance?: number;
  enableZoom?: boolean;
  fragmentCount?: number;
  fragmentShape?: 'triangle' | 'quad' | 'voronoi';
  shatterForce?: number;
  waveAxis?: 'x' | 'y' | 'z';
  decay?: number;
  pathPoints?: { x: number; y: number; z?: number }[];
  tension?: number;
  twist?: number;
  followSpeed?: number;
  grainSize?: number;
  grainIntensity?: number;
  revealThreshold?: number;
  noiseSeed?: number;
  particleCount?: number;
  particleShape?: 'circle' | 'square' | 'textGlyph';
  swarmForce?: number;
  settleSpeed?: number;
  dissolveDirection?: 'left' | 'right' | 'up' | 'down' | number;
  particleSize?: number;
  windForce?: number;
  dissolveSpread?: number;
  grainDensity?: number;
  erosionRate?: number;
  windDirection?: 'left' | 'right' | 'up' | 'down' | number;
  particleColor?: string;
  sparkColor?: string;
  sparkLifetime?: number;
  sparkVelocity?: number;
  emissionRate?: number;
  initialPixelSize?: number;
  refinementSteps?: number;
  pixelShape?: 'square' | 'circle';
  viscosity?: number;
  surfaceTension?: number;
  disturbanceForce?: number;
  colorDiffusion?: string;
  targetText?: string;
  morphDuration?: number;
  glyphInterpolation?: 'linear' | 'elastic';
  crossfade?: boolean;
  dropElasticity?: number;
  inflateScale?: number;
  wobbleAmplitude?: number;
  deflateDamping?: number;
  glitchIntensity?: number;
  sliceCount?: number;
  sliceWidth?: number;
  shiftAmount?: number;
  colorShift?: boolean;
  scanLines?: boolean;
  stretchFactor?: number;
  springTension?: number;
  overshoot?: number;
  distance?: number;
  from?: 'below' | 'current';
  angle?: number;
  bounceDamping?: number;
  cascadeDelay?: number;
  swingAngle?: number;
  anchorPoint?: 'top' | 'left' | 'right' | 'center';
  wipeDirection?: 'left' | 'right' | 'up' | 'down' | number;
  wipeEdgeSoftness?: number;
  maskColor?: string;
  typingSpeed?: number;
  cursorStyle?: 'block' | 'line' | 'underscore' | 'none';
  cursorBlinkRate?: number;
  deleteOnComplete?: boolean;
  loopDelay?: number;
  soundEnabled?: boolean;
  scrambleChars?: string;
  scrambleDuration?: number;
  resolveOrder?: 'sequential' | 'random' | 'simultaneous';
  cipherChars?: string;
  decryptSpeed?: number;
  revealGlow?: string;
  prompt?: string;
  lineDelay?: number;
  cursorChar?: string;
  greenScreenEffect?: boolean;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveDirection?: 'horizontal' | 'vertical';
  distortType?: 'skew' | 'scale' | 'baseline';
  colorChannels?: string[];
  glitchTiming?: 'periodic' | 'triggered' | 'continuous';
  seed?: number;
  exitDuration?: number;
  warpCurve?: string;
  warpIntensity?: number;
  warpRadius?: number;
  warpOrigin?: 'center' | 'top left';
  noiseScale?: number;
  noiseSpeed?: number;
  displacementAmount?: number;
  octaves?: number;
  stretchAxis?: 'x' | 'y';
  maxStretch?: number;
  snapBack?: boolean;
  bloatAmount?: number;
  bloatRadius?: number;
  bloatFalloff?: number;
  meltAmount?: number;
  dripLength?: number;
  dripViscosity?: number;
  meltSpread?: number;
  crackCount?: number;
  shardOffset?: number;
  shardRotation?: number;
  crackStyle?: 'jagged' | 'geometric';
  
  // Spatial
  direction?: 'up' | 'down' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | number;
  alignment?: { horizontal: 'left' | 'center' | 'right'; vertical: 'top' | 'middle' | 'bottom' };
  transformOrigin?: string | { x: number; y: number };
  reverse?: boolean;
  delay?: number | ((charIndex: number) => number);
}

export interface Renderer {
  container?: HTMLElement;
  glyphs: any[];
  mount(text: string): void;
  render(states: GlyphState[]): number;
  dispose(): void;
  resize?(): void;
}

export interface Plugin {
  name: string;
  install(core: typeof Anomotion): void;
}

function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Client-side Web Audio microphone level analyzer
let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let dataBuffer: any = new Uint8Array(0);
let micVolume = 0;

export const voiceEngine = {
  request(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      return Promise.resolve(false);
    }
    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyserNode);
        
        dataBuffer = new Uint8Array(analyserNode.frequencyBinCount);
        
        const update = () => {
          if (analyserNode) {
            analyserNode.getByteFrequencyData(dataBuffer);
            let sum = 0;
            for (let i = 0; i < dataBuffer.length; i++) {
              sum += dataBuffer[i];
            }
            micVolume = sum / dataBuffer.length;
            requestAnimationFrame(update);
          }
        };
        update();
        return true;
      })
      .catch(() => false);
  },
  getLevel() {
    return micVolume;
  }
};

export interface GlobalConfig {
  quality: 'auto' | 'performance' | 'balanced' | 'quality';
  defaults: {
    duration: number;
    easing: EasingType;
    stagger: number;
    renderer: string;
  };
  reducedMotion: 'respect' | 'ignore' | 'force';
  debug: {
    showFPS: boolean;
    showHitboxes: boolean;
    logPerformance: boolean;
    highlightThrashing: boolean;
  };
  renderer: {
    pixelRatio: 'auto' | number;
    antialias: boolean;
    powerPreference: string;
  };
  offline: {
    cacheOnLoad: boolean;
    preloadAll: boolean;
    versionLock: string | null;
  };
}

class AnimationLoop {
  private activeAnimations = new Set<TextAnimation>();
  private running = false;
  private lastTime = 0;
  private fps = 60;
  private fpsCallback: ((fps: number) => void) | null = null;
  private fpsOverlay: HTMLDivElement | null = null;

  register(animation: TextAnimation) {
    this.activeAnimations.add(animation);
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(t => this.tick(t));
    }
  }

  unregister(animation: TextAnimation) {
    this.activeAnimations.delete(animation);
    if (this.activeAnimations.size === 0) {
      this.running = false;
    }
  }

  setFpsCallback(cb: (fps: number) => void) {
    this.fpsCallback = cb;
  }

  private tick(time: number) {
    if (!this.running) return;

    if (!this.lastTime) this.lastTime = time;
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    if (delta > 0) {
      const currentFps = 1 / delta;
      this.fps = this.fps * 0.9 + currentFps * 0.1;
      if (this.fpsCallback) this.fpsCallback(this.fps);
      this.updateFpsOverlay();
    }

    for (const anim of this.activeAnimations) {
      const finished = anim.update(time);
      if (finished) {
        this.unregister(anim);
      }
    }

    requestAnimationFrame(t => this.tick(t));
  }

  private updateFpsOverlay() {
    if (Anomotion.config.debug.showFPS) {
      if (!this.fpsOverlay) {
        this.fpsOverlay = document.createElement('div');
        this.fpsOverlay.style.position = 'fixed';
        this.fpsOverlay.style.top = '10px';
        this.fpsOverlay.style.right = '10px';
        this.fpsOverlay.style.background = 'rgba(0,0,0,0.85)';
        this.fpsOverlay.style.color = '#00ff66';
        this.fpsOverlay.style.padding = '6px 10px';
        this.fpsOverlay.style.fontSize = '12px';
        this.fpsOverlay.style.fontFamily = 'monospace';
        this.fpsOverlay.style.borderRadius = '4px';
        this.fpsOverlay.style.zIndex = '99999';
        this.fpsOverlay.style.border = '1px solid rgba(255,255,255,0.1)';
        document.body.appendChild(this.fpsOverlay);
      }
      this.fpsOverlay.textContent = `FPS: ${Math.round(this.fps)}`;
    } else if (this.fpsOverlay) {
      this.fpsOverlay.remove();
      this.fpsOverlay = null;
    }
  }
}

export const globalLoop = new AnimationLoop();

export class TextAnimation {
  public renderer: Renderer;
  public options: Required<AnimationOptions>;
  private startTime = 0;
  public states: GlyphState[] = [];
  public physicsInstance: any = null;
  public paused = false;
  public reversed = false;
  public currentTime = 0;

  private memoizedEase: Record<number, number> = {};

  private mouseX = -9999;
  private mouseY = -9999;
  private mouseMoveHandler: any = null;
  private mouseLeaveHandler: any = null;
  private scrollHandler: any = null;

  private eventListeners: Record<string, (() => void)[]> = {};
  
  // Parsed SVG Path reference
  private pathElement: SVGPathElement | null = null;

  constructor(renderer: Renderer, options: AnimationOptions = {}) {
    this.renderer = renderer;
    
    const globalDefaults = Anomotion.config.defaults;
    this.options = {
      effect: options.effect || 'wave',
      duration: options.duration ?? globalDefaults.duration,
      stagger: options.stagger ?? globalDefaults.stagger,
      easing: options.easing || globalDefaults.easing,
      loop: options.loop ?? true,
      physics: options.physics ?? false,
      text: options.text || '',
      renderer: options.renderer || globalDefaults.renderer,
      textColor: options.textColor || '',
      glitchColor: options.glitchColor || '',
      customEquation: options.customEquation || '',
      mouseInteraction: options.mouseInteraction ?? true,
      frequency: options.frequency ?? 2.0,
      amplitude: options.amplitude ?? 30,
      style: options.style || {},
      path: options.path || 'none',
      scrollTrigger: options.scrollTrigger ?? false,
      
      depth: options.depth ?? 0.5,
      bevelThickness: options.bevelThickness ?? 0.02,
      bevelSegments: options.bevelSegments ?? 3,
      extrudeEasing: options.extrudeEasing || 'easeOutExpo',
      axis: options.axis || 'y',
      perChar: options.perChar ?? true,
      rotationSpeed: options.rotationSpeed ?? 1.0,
      explosionForce: options.explosionForce ?? 1.5,
      gravity: options.gravity ?? 9.8,
      scatterRadius: options.scatterRadius ?? 50,
      reassemblyDelay: options.reassemblyDelay ?? 0.5,
      foldAxis: options.foldAxis || 'bottom',
      foldAngle: options.foldAngle ?? 90,
      creaseColor: options.creaseColor || '#222222',
      orbitSpeed: options.orbitSpeed ?? 1.0,
      autoRotate: options.autoRotate ?? true,
      cameraDistance: options.cameraDistance ?? 200,
      enableZoom: options.enableZoom ?? false,
      fragmentCount: options.fragmentCount ?? 20,
      fragmentShape: options.fragmentShape || 'triangle',
      shatterForce: options.shatterForce ?? 1.0,
      waveAxis: options.waveAxis || 'y',
      decay: options.decay ?? 0.0,
      pathPoints: options.pathPoints || [],
      tension: options.tension ?? 0.5,
      twist: options.twist ?? 0.0,
      followSpeed: options.followSpeed ?? 1.0,
      grainSize: options.grainSize ?? 2.0,
      grainIntensity: options.grainIntensity ?? 0.15,
      revealThreshold: options.revealThreshold ?? 0.5,
      noiseSeed: options.noiseSeed ?? 42,
      particleCount: options.particleCount ?? 200,
      particleShape: options.particleShape || 'circle',
      swarmForce: options.swarmForce ?? 1.0,
      settleSpeed: options.settleSpeed ?? 1.0,
      dissolveDirection: options.dissolveDirection ?? 'right',
      particleSize: options.particleSize ?? 3,
      windForce: options.windForce ?? 0.5,
      dissolveSpread: options.dissolveSpread ?? 1.5,
      grainDensity: options.grainDensity ?? 0.8,
      erosionRate: options.erosionRate ?? 0.05,
      windDirection: options.windDirection ?? 'right',
      particleColor: options.particleColor || '#ffffff',
      sparkColor: options.sparkColor || '#ffaa00',
      sparkLifetime: options.sparkLifetime ?? 1.0,
      sparkVelocity: options.sparkVelocity ?? 2.0,
      emissionRate: options.emissionRate ?? 10,
      initialPixelSize: options.initialPixelSize ?? 16,
      refinementSteps: options.refinementSteps ?? 5,
      pixelShape: options.pixelShape || 'square',
      viscosity: options.viscosity ?? 0.5,
      surfaceTension: options.surfaceTension ?? 0.7,
      disturbanceForce: options.disturbanceForce ?? 1.0,
      colorDiffusion: options.colorDiffusion || '#0070f3',
      targetText: options.targetText || '',
      morphDuration: options.morphDuration ?? 1.0,
      glyphInterpolation: options.glyphInterpolation || 'linear',
      crossfade: options.crossfade ?? true,
      dropElasticity: options.dropElasticity ?? 0.6,
      inflateScale: options.inflateScale ?? 1.5,
      wobbleAmplitude: options.wobbleAmplitude ?? 0.1,
      deflateDamping: options.deflateDamping ?? 0.9,
      glitchIntensity: options.glitchIntensity ?? 0.3,
      sliceCount: options.sliceCount ?? 8,
      sliceWidth: options.sliceWidth ?? 10,
      shiftAmount: options.shiftAmount ?? 15,
      colorShift: options.colorShift ?? true,
      scanLines: options.scanLines ?? false,
      stretchFactor: options.stretchFactor ?? 1.4,
      springTension: options.springTension ?? 0.05,
      overshoot: options.overshoot ?? 0.1,
      distance: options.distance ?? 50,
      from: options.from || 'below',
      angle: options.angle ?? 90,
      bounceDamping: options.bounceDamping ?? 0.6,
      cascadeDelay: options.cascadeDelay ?? 0.05,
      swingAngle: options.swingAngle ?? 45,
      anchorPoint: options.anchorPoint || 'top',
      wipeDirection: options.wipeDirection || 'right',
      wipeEdgeSoftness: options.wipeEdgeSoftness ?? 0.2,
      maskColor: options.maskColor || 'rgba(0,0,0,0.8)',
      typingSpeed: options.typingSpeed ?? 0.1,
      cursorStyle: options.cursorStyle || 'underscore',
      cursorBlinkRate: options.cursorBlinkRate ?? 530,
      deleteOnComplete: options.deleteOnComplete ?? false,
      loopDelay: options.loopDelay ?? 1.5,
      soundEnabled: options.soundEnabled ?? false,
      scrambleChars: options.scrambleChars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*',
      scrambleDuration: options.scrambleDuration ?? 0.8,
      resolveOrder: options.resolveOrder || 'sequential',
      cipherChars: options.cipherChars || '0123456789ABCDEF',
      decryptSpeed: options.decryptSpeed ?? 0.08,
      revealGlow: options.revealGlow || '#00ff66',
      prompt: options.prompt || '$ ',
      lineDelay: options.lineDelay ?? 0.3,
      cursorChar: options.cursorChar || '\u2588',
      greenScreenEffect: options.greenScreenEffect ?? true,
      waveAmplitude: options.waveAmplitude ?? 20,
      waveFrequency: options.waveFrequency ?? 2.0,
      waveDirection: options.waveDirection || 'horizontal',
      distortType: options.distortType || 'skew',
      colorChannels: options.colorChannels || ['#ff0055', '#00ffaa', '#0070f3'],
      glitchTiming: options.glitchTiming || 'periodic',
      seed: options.seed ?? 42,
      exitDuration: options.exitDuration ?? 0.3,
      warpCurve: options.warpCurve || 'M 0 0 Q 50 100 100 0',
      warpIntensity: options.warpIntensity ?? 0.5,
      warpRadius: options.warpRadius ?? 100,
      warpOrigin: options.warpOrigin || 'center',
      noiseScale: options.noiseScale ?? 0.1,
      noiseSpeed: options.noiseSpeed ?? 1.0,
      displacementAmount: options.displacementAmount ?? 15,
      octaves: options.octaves ?? 3,
      stretchAxis: options.stretchAxis || 'x',
      maxStretch: options.maxStretch ?? 2.0,
      snapBack: options.snapBack ?? true,
      bloatAmount: options.bloatAmount ?? 30,
      bloatRadius: options.bloatRadius ?? 150,
      bloatFalloff: options.bloatFalloff ?? 1.0,
      meltAmount: options.meltAmount ?? 40,
      dripLength: options.dripLength ?? 25,
      dripViscosity: options.dripViscosity ?? 0.4,
      meltSpread: options.meltSpread ?? 0.5,
      crackCount: options.crackCount ?? 5,
      shardOffset: options.shardOffset ?? 15,
      shardRotation: options.shardRotation ?? 10,
      crackStyle: options.crackStyle || 'jagged',
      direction: options.direction ?? 'up',
      alignment: options.alignment || { horizontal: 'center', vertical: 'middle' },
      transformOrigin: options.transformOrigin || 'center',
      reverse: options.reverse ?? false,
      delay: options.delay ?? 0
    } as any;

    this.initStates();
    this.initMouseListeners();
    this.initScrollListeners();
    this.initPathElement();
  }

  on(event: string, callback: () => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return this;
  }

  private trigger(event: string) {
    const listeners = this.eventListeners[event];
    if (listeners) {
      for (const listener of listeners) {
        listener();
      }
    }
  }

  private initPathElement() {
    if (typeof document !== 'undefined' && this.options.path && this.options.path !== 'none') {
      try {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        this.pathElement = document.createElementNS(svgNS, 'path');
        this.pathElement.setAttribute('d', this.options.path);
        svg.appendChild(this.pathElement);
      } catch (e) {
        console.error('Anomotion: Failed to parse SVG path string', e);
      }
    }
  }

  private initMouseListeners() {
    if (this.renderer.container && this.options.mouseInteraction) {
      const container = this.renderer.container;
      this.mouseMoveHandler = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      };
      this.mouseLeaveHandler = () => {
        this.mouseX = -9999;
        this.mouseY = -9999;
      };
      container.addEventListener('mousemove', this.mouseMoveHandler);
      container.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }

  private initScrollListeners() {
    if (this.options.scrollTrigger && typeof window !== 'undefined') {
      this.paused = true; // Handled strictly by scroll updates
      this.scrollHandler = () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollTop / (maxScroll || 1);
        this.currentTime = pct * this.options.duration;
        this.update(performance.now());
      };
      window.addEventListener('scroll', this.scrollHandler);
    }
  }

  private cleanupListeners() {
    if (this.renderer.container && this.mouseMoveHandler) {
      this.renderer.container.removeEventListener('mousemove', this.mouseMoveHandler);
      this.renderer.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private initStates() {
    this.states = this.renderer.glyphs.map((g: any) => ({
      originalX: 0,
      originalY: 0,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      char: g.char || ''
    }));
  }

  private getStaggerDelay(index: number): number {
    const stagger = this.options.stagger;
    if (typeof stagger === 'number') {
      return (index * stagger) / 1000;
    }
    const len = this.states.length;
    if (stagger === 'random') {
      const seed = this.options.seed ?? 42;
      return seedRandom(seed + index) * 0.5;
    }
    const from = stagger.from || 'left';
    if (from === 'left') {
      return (index * 0.05);
    } else if (from === 'right') {
      return ((len - 1 - index) * 0.05);
    } else if (from === 'center') {
      const mid = (len - 1) / 2;
      return Math.abs(index - mid) * 0.05;
    } else if (from === 'edges') {
      const mid = (len - 1) / 2;
      return (mid - Math.abs(index - mid)) * 0.05;
    }
    return 0;
  }

  private evaluateEasing(itemProgress: number): number {
    const cacheKey = Math.round(itemProgress * 10000) / 10000;
    if (this.memoizedEase[cacheKey] !== undefined) {
      return this.memoizedEase[cacheKey];
    }

    const easing = this.options.easing;
    let val = 0;

    if (typeof easing === 'string' && Easing[easing]) {
      val = Easing[easing](itemProgress);
    } 
    else if (typeof easing === 'string' && easing.startsWith('spring')) {
      try {
        const paramsMatch = easing.match(/\{.*\}/);
        const params = paramsMatch ? JSON.parse(paramsMatch[0].replace(/'/g, '"')) : { mass: 1, stiffness: 170, damping: 26 };
        const solver = solveSpringRK4(params.mass || 1, params.stiffness || 170, params.damping || 26);
        val = solver(itemProgress);
      } catch (e) {
        val = Easing.easeOutExpo(itemProgress);
      }
    }
    else if (typeof easing === 'string' && easing.startsWith('cubic-bezier')) {
      try {
        const coords = easing.match(/\(([^)]+)\)/)?.[1].split(',').map(Number) || [0.25, 0.1, 0.25, 1];
        const solver = solveCubicBezier(coords[0], coords[1], coords[2], coords[3]);
        val = solver(itemProgress);
      } catch (e) {
        val = Easing.easeOutExpo(itemProgress);
      }
    }
    else if (typeof easing === 'string' && easing.startsWith('steps')) {
      try {
        const argsMatch = easing.match(/\(([^)]+)\)/)?.[1].split(',') || ['5', 'end'];
        const count = parseInt(argsMatch[0].trim());
        const direction = (argsMatch[1]?.trim() as 'start' | 'end') || 'end';
        const solver = solveSteps(count, direction);
        val = solver(itemProgress);
      } catch (e) {
        val = Easing.easeOutExpo(itemProgress);
      }
    } else {
      val = Easing.easeOutExpo(itemProgress);
    }

    this.memoizedEase[cacheKey] = val;
    return val;
  }

  update(time: number): boolean {
    if (this.paused && !this.options.scrollTrigger) return false;

    const rm = Anomotion.config.reducedMotion;
    const systemPrefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm === 'force' || (rm === 'respect' && systemPrefersReduced)) {
      for (const state of this.states) {
        state.x = 0; state.y = 0;
        state.scaleX = 1; state.scaleY = 1;
        state.rotation = 0;
        state.opacity = 1;
      }
      this.renderer.render(this.states);
      this.trigger('complete');
      return true;
    }

    if (!this.startTime) {
      this.startTime = time;
      this.trigger('start');
    }
    const diff = (time - this.startTime) / 1000;

    const loopType = this.options.loop;
    const duration = this.options.duration;

    if (!this.options.scrollTrigger) {
      if (this.reversed) {
        this.currentTime = Math.max(0, this.currentTime - diff);
        if (this.currentTime <= 0 && loopType) {
          this.currentTime = duration;
        }
      } else {
        this.currentTime += diff;
        if (this.currentTime >= duration) {
          if (loopType === 'pingpong') {
            this.reversed = true;
            this.currentTime = duration;
          } else if (loopType) {
            this.currentTime = 0;
          } else {
            this.currentTime = duration;
          }
        }
      }
      this.startTime = time;
    }

    const freq = this.options.frequency;
    const amp = this.options.amplitude;
    const effect = this.options.effect;
    const style = this.options.style;

    let customEqFunc: ((t: number, i: number) => number) | null = null;
    if (this.options.customEquation) {
      const eq = this.options.customEquation;
      if (typeof eq === 'function') {
        customEqFunc = eq;
      } else if (typeof eq === 'string' && eq.trim() !== '') {
        try {
          customEqFunc = new Function('t', 'i', `return ${eq};`) as any;
        } catch (e) {
          console.error('Anomotion: Failed to compile customEquation:', e);
        }
      }
    }

    const customEffectFactory = Anomotion.effect.get(effect);
    let customEffectCallback: any = null;
    if (customEffectFactory) {
      try {
        const ctx = {
          progress: this.currentTime / duration,
          characters: this.renderer.glyphs,
          globalOptions: this.options,
          renderer: this.renderer
        };
        customEffectCallback = customEffectFactory(ctx);
      } catch (e) {
        console.error(`Anomotion: Custom effect factory '${effect}' error:`, e);
      }
    }

    // Path details
    let pathLength = 0;
    if (this.pathElement) {
      try {
        pathLength = this.pathElement.getTotalLength();
      } catch (e) {}
    }

    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      const staggerDelay = this.getStaggerDelay(i);
      
      let delayVal = 0;
      if (typeof this.options.delay === 'function') {
        delayVal = this.options.delay(i);
      } else if (typeof this.options.delay === 'number') {
        delayVal = this.options.delay;
      }

      let itemProgress = Math.max(0, this.currentTime - staggerDelay - delayVal) / (duration - staggerDelay - delayVal || 0.001);
      if (itemProgress > 1) {
        itemProgress = loopType ? itemProgress % 1.0 : 1;
      }

      const t = this.evaluateEasing(itemProgress);

      state.originalX = 0;
      state.originalY = 0;
      state.scaleX = 1;
      state.scaleY = 1;
      state.rotation = 0;
      state.opacity = 1;
      state.color = this.options.textColor || undefined;
      state.filter = undefined;

      // Handle SVG Path positioning overrides
      if (this.pathElement && pathLength > 0) {
        try {
          const charPercent = i / (this.states.length || 1);
          // Animate starting offset or flow along path
          const pct = (charPercent + t * 0.1) % 1.0;
          const pt = this.pathElement.getPointAtLength(pct * pathLength);
          
          // Map to relative offsets centered in screen
          state.originalX = pt.x - 300;
          state.originalY = pt.y - 120;
        } catch (e) {}
      }

      if (customEffectCallback) {
        try {
          const styleDeltas = customEffectCallback(t, i);
          if (styleDeltas) {
            Object.assign(state, styleDeltas);
          }
        } catch (e) {}
      } else if (customEqFunc) {
        try {
          state.originalY = customEqFunc(t, i);
        } catch (e) {}
      } else {
        switch (effect) {
          case 'bounceVoice':
            const ampLevel = voiceEngine.getLevel(); // 0..255
            state.originalY = -(ampLevel / 255) * amp * 3.5;
            state.scaleY = 1 + (ampLevel / 255) * 0.5;
            state.scaleX = 1 - (ampLevel / 255) * 0.15;
            break;

          case 'breathe':
            const brScale = 1 + Math.sin(t * Math.PI * 2) * 0.15;
            state.scaleX = brScale;
            state.scaleY = brScale;
            break;

          case 'neonSign':
            const flick = seedRandom(this.options.seed + i + Math.floor(time / 80)) > 0.85;
            state.opacity = flick ? 0.35 : 1.0;
            if (flick) {
              state.color = '#334155';
            }
            break;

          case 'waterRipple':
            state.originalY = Math.sin(t * Math.PI * freq + i * 0.4) * (amp / 2);
            state.scaleX = 1 + Math.cos(t * Math.PI * freq + i * 0.4) * 0.12;
            break;

          case 'leafFall':
            state.originalY = t * 140;
            state.originalX = Math.sin(t * Math.PI * 3.0 + i) * 25;
            state.rotation = Math.cos(t * Math.PI * 2.0) * 30;
            state.opacity = Math.max(0, 1 - t * 1.1);
            break;

          case 'scanLine':
            state.originalY = (t * 80) % 25;
            state.opacity = 0.9 + Math.sin(time / 60) * 0.1;
            break;

          case 'dataCorrupt':
            const corr = seedRandom(this.options.seed + i + Math.floor(time / 160)) > 0.88;
            if (corr) {
              const wrongGlyph = String.fromCharCode(33 + Math.floor(seedRandom(time + i) * 90));
              state.char = wrongGlyph;
              state.color = '#ef4444';
            }
            break;

          case 'vhsRewind':
            const scanLineOffset = Math.sin(time / 12) * 20 * (1 - t);
            const isFlicking = seedRandom(this.options.seed + Math.floor(time / 120)) > 0.88;
            state.originalX = isFlicking ? scanLineOffset : 0;
            state.opacity = isFlicking ? 0.7 : 1.0;
            break;

          case 'whisper':
            state.opacity = t * 0.65;
            state.originalX = (seedRandom(this.options.seed + i) - 0.5) * 15 * (1 - t);
            break;

          case 'shout':
            const shScale = t < 0.25 ? 1 + (1 - t / 0.25) * 1.6 : 1.0;
            state.scaleX = state.scaleY = shScale;
            state.originalY = t < 0.25 ? -60 * (1 - t / 0.25) : 0;
            state.rotation = t < 0.25 ? (seedRandom(i) - 0.5) * 10 * (1 - t / 0.25) : 0;
            break;

          case 'typewriterDelete':
            const stage = Math.floor(time / 3000) % 3;
            const cycleProgress = (time % 3000) / 3000;
            const totalChars = this.states.length;
            
            if (stage === 0) {
              // Type forward
              const showCount = Math.floor(cycleProgress * totalChars);
              state.opacity = i <= showCount ? 1 : 0;
            } else if (stage === 1) {
              // Retract/Delete half
              const deleteStart = Math.floor(totalChars / 2);
              const delProgress = Math.floor(cycleProgress * (totalChars / 2));
              state.opacity = i <= (totalChars - delProgress) ? 1 : 0;
            } else {
              // Repopulate
              const half = Math.floor(totalChars / 2);
              const addProgress = Math.floor(cycleProgress * half);
              state.opacity = i <= (half + addProgress) ? 1 : 0;
            }
            break;

          case 'realTimeClock':
            const hrs = new Date().toTimeString().split(' ')[0];
            state.char = hrs[i % hrs.length];
            break;

          case 'relativeTime':
            const countSec = Math.floor((time - this.startTime) / 1000);
            if (countSec > 8) {
              state.char = '?';
              state.color = '#f59e0b';
            }
            break;

          case 'wave':
            if (!this.pathElement) {
              state.originalY = Math.sin(t * Math.PI * freq + i * 0.4) * -amp;
            }
            state.scaleX = 1 + Math.sin(t * Math.PI * freq) * 0.15;
            state.scaleY = 1 + Math.cos(t * Math.PI * freq) * 0.15;
            break;

          case 'reveal':
            if (!this.pathElement) {
              state.originalY = (1 - t) * 50;
            }
            state.opacity = t;
            break;

          case 'explode':
            const expProg = 1 - t;
            state.originalX += (i - this.states.length / 2) * expProg * (amp * 1.5);
            state.originalY += Math.sin(i * 1.2) * expProg * (amp * 2);
            state.scaleX = state.scaleY = t;
            state.opacity = t;
            break;

          case 'float':
            if (!this.pathElement) {
              state.originalY = Math.sin(t * Math.PI * freq + i * 0.5) * amp;
            }
            state.rotation = Math.cos(t * Math.PI * freq + i * 0.3) * 5;
            break;

          case 'vortex':
            const vAngle = t * Math.PI * freq + i * 0.5;
            const vRadius = (1 - t) * amp * 2.5;
            state.originalX += Math.cos(vAngle) * vRadius;
            state.originalY += Math.sin(vAngle) * vRadius;
            state.opacity = t;
            state.rotation = t * 360;
            break;

          case 'distortion':
          case 'distort':
            state.originalX += Math.sin(t * Math.PI * freq + i) * (amp / 3);
            state.originalY += Math.cos(t * Math.PI * freq) * (amp * 0.67);
            state.rotation = Math.sin(t * Math.PI) * 45;
            break;

          case 'glitch':
            const gSeed = this.options.seed + Math.floor(time / 80);
            const isGlitched = seedRandom(gSeed) < this.options.glitchIntensity;
            if (isGlitched) {
              const offsetSeed = seedRandom(gSeed + i * 13);
              state.originalX += (offsetSeed - 0.5) * this.options.shiftAmount;
              state.originalY += (seedRandom(gSeed + i * 19) - 0.5) * 5;
              state.scaleX = 1 + (offsetSeed - 0.5) * 0.2;
              state.opacity = 0.9;
              if (this.options.colorShift) {
                const colors = this.options.colorChannels;
                state.color = colors[Math.floor(offsetSeed * colors.length)];
              }
            }
            break;

          default:
            break;
        }
      }

      state.x = state.originalX;
      state.y = state.originalY;

      // Magnetic mouse attract/repel constraints
      if (this.options.mouseInteraction && this.mouseX !== -9999 && this.mouseY !== -9999 && this.renderer.container) {
        const charWidth = 24;
        const totalWidth = this.states.length * charWidth;
        const containerWidth = this.renderer.container.clientWidth || 800;
        const containerHeight = this.renderer.container.clientHeight || 200;

        const glyphX = (containerWidth - totalWidth) / 2 + i * charWidth + charWidth / 2;
        const glyphY = containerHeight / 2;

        const dx = this.mouseX - (glyphX + state.x);
        const dy = this.mouseY - (glyphY + state.y);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const force = (130 - dist) / 130;
          const pushAngle = Math.atan2(dy, dx);
          // Attract/Repel verlet style
          state.x += Math.cos(pushAngle) * force * -45;
          state.y += Math.sin(pushAngle) * force * -45;
          state.rotation += Math.sin(pushAngle) * force * 35;
        }
      }
    }

    const renderStartTime = performance.now();
    const renderDuration = this.renderer.render(this.states);
    const totalDuration = performance.now() - renderStartTime;

    if (Anomotion.config.debug.logPerformance && Math.random() > 0.99) {
      console.log(`[Anomotion Render Performance] Renderer: ${this.options.renderer}, duration: ${renderDuration.toFixed(2)}ms, Total frame compute: ${totalDuration.toFixed(2)}ms`);
    }

    const finished = this.currentTime >= duration && !loopType;
    if (finished) {
      this.trigger('complete');
    }
    return finished;
  }

  destroy() {
    this.cleanupListeners();
    if (this.renderer.container && (this.renderer.container as any)._anomotion === this) {
      delete (this.renderer.container as any)._anomotion;
    }
    this.renderer.dispose();
  }
}

export const Anomotion = {
  activeInstance: null as TextAnimation | null,
  renderers: new Map<string, any>(),
  plugins: new Set<Plugin>(),
  customEffects: new Map<string, (context: any) => (t: number, i: number) => any>(),
  
  voice: voiceEngine,

  config: {
    quality: 'auto',
    defaults: {
      duration: 1.2,
      easing: 'easeOutExpo',
      stagger: 0.05,
      renderer: 'auto'
    },
    reducedMotion: 'respect',
    debug: {
      showFPS: false,
      showHitboxes: false,
      logPerformance: false,
      highlightThrashing: false
    },
    renderer: {
      pixelRatio: 'auto',
      antialias: true,
      powerPreference: 'high-performance'
    },
    offline: {
      cacheOnLoad: true,
      preloadAll: false,
      versionLock: null
    }
  } as GlobalConfig,

  configure(newConfig: Partial<GlobalConfig> | any) {
    if (!newConfig) return;
    if (newConfig.quality) this.config.quality = newConfig.quality;
    if (newConfig.reducedMotion) this.config.reducedMotion = newConfig.reducedMotion;
    if (newConfig.defaults) this.config.defaults = { ...this.config.defaults, ...newConfig.defaults };
    if (newConfig.debug) this.config.debug = { ...this.config.debug, ...newConfig.debug };
    if (newConfig.renderer) this.config.renderer = { ...this.config.renderer, ...newConfig.renderer };
    if (newConfig.offline) this.config.offline = { ...this.config.offline, ...newConfig.offline };
    return this;
  },

  registerRenderer(name: string, rendererClass: any) {
    this.renderers.set(name, rendererClass);
  },

  use(plugin: Plugin) {
    if (!this.plugins.has(plugin)) {
      this.plugins.add(plugin);
      plugin.install(this);
    }
    return this;
  },

  easing: {
    register(name: string, easingFn: (t: number) => number) {
      Easing[name] = easingFn;
      return this;
    }
  },

  effect: {
    register(name: string, factory: (context: any) => (t: number, i: number) => any) {
      Anomotion.customEffects.set(name, factory);
      return this;
    },
    get(name: string) {
      return Anomotion.customEffects.get(name);
    }
  },

  timeline(options: AnimationOptions = {}) {
    const container = document.createElement('div');
    const rendClass = Anomotion.renderers.get('dom');
    const rendererInstance = new rendClass(container);
    rendererInstance.mount(options.text || '');
    
    const anim = new TextAnimation(rendererInstance, {
      ...options,
      loop: false
    });
    
    return {
      play() {
        anim.paused = false;
        globalLoop.register(anim);
        return this;
      },
      pause() {
        anim.paused = true;
        return this;
      },
      seek(t: number) {
        anim.currentTime = t * anim.options.duration;
        anim.update(performance.now());
        return this;
      },
      reverse() {
        anim.reversed = !anim.reversed;
        return this;
      },
      on(event: string, cb: () => void) {
        anim.on(event, cb);
        return this;
      },
      destroy() {
        anim.destroy();
      }
    };
  },

  create(selector: string | HTMLElement, options: AnimationOptions = {}) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!container) {
      console.error(`Anomotion: Container element not found.`);
      return null;
    }

    if ((container as any)._anomotion) {
      (container as any)._anomotion.destroy();
    }

    let rendererType = options.renderer || this.config.defaults.renderer;
    if (rendererType === 'auto') {
      rendererType = 'dom';
    }
    
    let RendererClass = this.renderers.get(rendererType);
    if (!RendererClass) {
      RendererClass = this.renderers.get('dom');
      console.warn(`Anomotion: Renderer "${rendererType}" is not registered. Falling back to DOM.`);
    }

    const rendererInstance = new RendererClass(container);
    rendererInstance.mount(options.text || container.textContent || '');

    const anim = new TextAnimation(rendererInstance, options);
    (container as any)._anomotion = anim;
    globalLoop.register(anim);

    this.activeInstance = anim;
    return anim;
  },

  ready() {
    return Promise.resolve();
  }
};

export default Anomotion;
