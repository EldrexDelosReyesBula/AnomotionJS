export type EasingType = 'linear' | 'easeOutElastic' | 'easeInOutQuad' | 'easeOutBounce' | 'easeOutBack';

export const Easing: Record<EasingType, (t: number) => number> = {
  linear: t => t,
  easeOutElastic: t => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
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
  easeOutBack: t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};

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
}

export interface AnimationOptions {
  effect?: string;
  duration?: number;
  stagger?: number;
  easing?: EasingType;
  loop?: boolean;
  physics?: boolean;
  text?: string;
  renderer?: 'dom' | 'canvas' | 'three' | 'webgpu';
  textColor?: string;
  glitchColor?: string;
  customEquation?: string | ((t: number, i: number) => number);
  mouseInteraction?: boolean;
  frequency?: number;
  amplitude?: number;
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

class AnimationLoop {
  private activeAnimations = new Set<TextAnimation>();
  private running = false;
  private lastTime = 0;
  private fps = 60;
  private fpsCallback: ((fps: number) => void) | null = null;

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
    }

    for (const anim of this.activeAnimations) {
      const finished = anim.update(time);
      if (finished) {
        this.unregister(anim);
      }
    }

    requestAnimationFrame(t => this.tick(t));
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

  private mouseX = -9999;
  private mouseY = -9999;
  private mouseMoveHandler: any = null;
  private mouseLeaveHandler: any = null;

  constructor(renderer: Renderer, options: AnimationOptions = {}) {
    this.renderer = renderer;
    this.options = {
      effect: options.effect || 'wave',
      duration: options.duration ?? 1.8,
      stagger: options.stagger ?? 50,
      easing: options.easing || 'easeOutElastic',
      loop: options.loop ?? true,
      physics: options.physics ?? false,
      text: options.text || '',
      renderer: options.renderer || 'dom',
      textColor: options.textColor || '',
      glitchColor: options.glitchColor || '',
      customEquation: options.customEquation || '',
      mouseInteraction: options.mouseInteraction ?? true,
      frequency: options.frequency ?? 2.0,
      amplitude: options.amplitude ?? 30
    } as any;

    this.initStates();
    this.initMouseListeners();
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

  private cleanupMouseListeners() {
    if (this.renderer.container && this.mouseMoveHandler) {
      this.renderer.container.removeEventListener('mousemove', this.mouseMoveHandler);
      this.renderer.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }

  private initStates() {
    this.states = this.renderer.glyphs.map(() => ({
      originalX: 0,
      originalY: 0,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1
    }));
  }

  update(time: number): boolean {
    if (this.paused) return false;

    if (!this.startTime) this.startTime = time;
    const diff = (time - this.startTime) / 1000;

    if (this.reversed) {
      this.currentTime = Math.max(0, this.currentTime - diff);
      if (this.currentTime <= 0 && this.options.loop) {
        this.currentTime = this.options.duration;
      }
    } else {
      this.currentTime += diff;
      if (this.currentTime >= this.options.duration) {
        if (this.options.loop) {
          this.currentTime = 0;
        } else {
          this.currentTime = this.options.duration;
        }
      }
    }
    this.startTime = time;

    if ((window as any).onPlaybackProgress) {
      (window as any).onPlaybackProgress(this.currentTime, this.options.duration);
    }

    const duration = this.options.duration;
    const easeFunc = Easing[this.options.easing] || Easing.linear;
    const freq = this.options.frequency;
    const amp = this.options.amplitude;

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

    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      const staggerDelay = (i * this.options.stagger) / 1000;
      let itemProgress = Math.max(0, this.currentTime - staggerDelay) / (duration - staggerDelay);
      if (itemProgress > 1) itemProgress = this.options.loop ? itemProgress % 1.0 : 1;

      const t = easeFunc(itemProgress);

      state.originalX = 0;
      state.originalY = 0;
      state.scaleX = 1;
      state.scaleY = 1;
      state.rotation = 0;
      state.opacity = 1;
      state.color = this.options.textColor || undefined;

      if (customEqFunc) {
        try {
          state.originalY = customEqFunc(t, i);
        } catch (e) {
          // ignore eval errors
        }
      } else {
        switch (this.options.effect) {
          case 'wave':
            state.originalY = Math.sin(t * Math.PI * freq) * -amp;
            state.scaleX = 1 + Math.sin(t * Math.PI * freq) * 0.15;
            state.scaleY = 1 + Math.cos(t * Math.PI * freq) * 0.15;
            break;

          case 'glitch':
            const glitch = Math.random() > 0.85;
            state.originalX = glitch ? (Math.random() - 0.5) * 15 : 0;
            state.originalY = glitch ? (Math.random() - 0.5) * 6 : 0;
            state.scaleX = glitch ? 1.3 : 1;
            state.opacity = glitch ? 0.8 : 1;
            if (glitch && this.options.glitchColor) {
              state.color = this.options.glitchColor;
            }
            break;

          case 'reveal':
            state.originalY = (1 - t) * 50;
            state.opacity = t;
            break;

          case 'explode':
            const progress = 1 - t;
            state.originalX = (i - this.states.length / 2) * progress * (amp * 1.5);
            state.originalY = Math.sin(i) * progress * (amp * 2);
            state.scaleX = state.scaleY = t;
            state.opacity = t;
            break;

          case 'float':
            state.originalY = Math.sin(t * Math.PI * freq + i * 0.5) * amp;
            state.rotation = Math.cos(t * Math.PI * freq + i * 0.3) * 5;
            break;

          case 'vortex':
            const angle = t * Math.PI * freq + i * 0.5;
            const radius = (1 - t) * amp * 2.5;
            state.originalX = Math.cos(angle) * radius;
            state.originalY = Math.sin(angle) * radius;
            state.opacity = t;
            state.rotation = t * 360;
            break;

          case 'distortion':
          case 'distort':
            state.originalX = Math.sin(t * Math.PI * freq + i) * (amp / 3);
            state.originalY = Math.cos(t * Math.PI * freq) * (amp * 0.67);
            state.rotation = Math.sin(t * Math.PI) * 45;
            break;

          case 'spiral':
            const theta = t * Math.PI * freq + i * 0.5;
            const r = (1 - t) * amp * 3;
            state.originalX = Math.cos(theta) * r;
            state.originalY = Math.sin(theta) * r;
            state.scaleX = state.scaleY = t;
            break;

          case 'morph':
            state.scaleX = 1 + Math.sin(t * Math.PI * freq) * 0.8;
            state.scaleY = 1 + Math.cos(t * Math.PI * freq) * 0.8;
            state.rotation = t * 180;
            break;

          default:
            state.originalY = 0;
            state.originalX = 0;
            state.opacity = 1;
        }
      }

      if (!this.physicsInstance) {
        state.x = state.originalX;
        state.y = state.originalY;
      }

      if (this.options.mouseInteraction && this.mouseX !== -9999 && this.mouseY !== -9999 && this.renderer.container) {
        const charWidth = 24;
        const totalWidth = this.states.length * charWidth;
        const containerWidth = this.renderer.container.clientWidth || 800;
        const containerHeight = this.renderer.container.clientHeight || 200;

        const glyphX = (containerWidth - totalWidth) / 2 + i * charWidth + charWidth / 2;
        const glyphY = containerHeight / 2;

        const dx = this.mouseX - glyphX;
        const dy = this.mouseY - glyphY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const force = (120 - dist) / 120;
          const pushAngle = Math.atan2(dy, dx);
          state.x += Math.cos(pushAngle) * force * -40;
          state.y += Math.sin(pushAngle) * force * -40;
          state.rotation += Math.sin(pushAngle) * force * 30;
        }
      }
    }

    if (this.physicsInstance) {
      this.physicsInstance.update(this.states, this.currentTime);
    }

    this.renderer.render(this.states);
    return this.currentTime >= duration && !this.options.loop;
  }

  destroy() {
    this.cleanupMouseListeners();
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

  create(selector: string | HTMLElement, options: AnimationOptions = {}) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!container) {
      console.error(`Anomotion: Container element not found.`);
      return null;
    }

    // Destroy existing animation on this specific element to prevent overlap
    if ((container as any)._anomotion) {
      (container as any)._anomotion.destroy();
    }

    const rendererType = options.renderer || 'dom';
    const RendererClass = this.renderers.get(rendererType);
    
    if (!RendererClass) {
      console.error(`Anomotion: Renderer "${rendererType}" is not registered.`);
      return null;
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
