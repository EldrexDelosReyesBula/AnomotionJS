import { Renderer, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';
import { TextParser } from '@eldrex/anomotionjs-text';

export class DomRenderer implements Renderer {
  public container: HTMLElement;
  public glyphs: {
    element: HTMLElement;
    mainSpan: HTMLElement;
    rLayer: HTMLElement;
    bLayer: HTMLElement;
    char: string;
  }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(text: string): void {
    this.container.innerHTML = '';
    const elements = TextParser.injectDOMSpans(this.container, text);
    
    this.glyphs = elements.map((element) => {
      const char = element.textContent || '';
      element.innerHTML = '';
      element.style.position = 'relative';
      element.style.display = 'inline-block';
      element.style.willChange = 'transform, opacity';
      
      const mainSpan = document.createElement('span');
      mainSpan.textContent = char === ' ' ? '\u00A0' : char;
      mainSpan.style.display = 'inline-block';
      mainSpan.style.willChange = 'transform';
      element.appendChild(mainSpan);

      const rLayer = document.createElement('span');
      rLayer.textContent = char === ' ' ? '\u00A0' : char;
      rLayer.style.position = 'absolute';
      rLayer.style.left = '0';
      rLayer.style.top = '0';
      rLayer.style.color = '#ff0055';
      rLayer.style.mixBlendMode = 'screen';
      rLayer.style.opacity = '0';
      rLayer.style.transition = 'opacity 0.2s ease';
      rLayer.style.willChange = 'transform, opacity';
      rLayer.style.pointerEvents = 'none';
      element.appendChild(rLayer);

      const bLayer = document.createElement('span');
      bLayer.textContent = char === ' ' ? '\u00A0' : char;
      bLayer.style.position = 'absolute';
      bLayer.style.left = '0';
      bLayer.style.top = '0';
      bLayer.style.color = '#00f0ff';
      bLayer.style.mixBlendMode = 'screen';
      bLayer.style.opacity = '0';
      bLayer.style.transition = 'opacity 0.2s ease';
      bLayer.style.willChange = 'transform, opacity';
      bLayer.style.pointerEvents = 'none';
      element.appendChild(bLayer);

      return {
        element,
        mainSpan,
        rLayer,
        bLayer,
        char
      };
    });
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    const activeAnim = Anomotion.activeInstance;
    const style = activeAnim?.options.style;

    // Apply container background
    if (style && style.background) {
      this.container.style.background = style.background;
    }

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const state = states[i];
      if (!state) continue;

      const { element, mainSpan, rLayer, bLayer } = glyph;

      // Will change lifecycle optimizer
      element.style.willChange = activeAnim?.paused ? 'auto' : 'transform, opacity';

      const transform = `translate3d(${state.x}px, ${state.y}px, ${state.z || 0}px) rotate(${state.rotation}deg) scale(${state.scaleX}, ${state.scaleY})`;
      element.style.transform = transform;
      element.style.opacity = state.opacity.toString();
      
      // Reset color
      mainSpan.style.color = state.color || style?.textColor || '';

      if (state.filter) {
        element.style.filter = state.filter;
      } else {
        element.style.filter = '';
      }

      // Apply gradients, shadows, glows
      if (style) {
        if (style.shadow) {
          mainSpan.style.textShadow = `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`;
        } else if (style.glow) {
          mainSpan.style.textShadow = `0 0 ${style.glow.radius}px ${style.glow.color}`;
        } else {
          mainSpan.style.textShadow = '';
        }

        if (style.gradient) {
          const grad = style.gradient;
          let cssGrad = '';
          const colors = grad.stops 
            ? grad.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')
            : grad.colors.join(', ');

          if (grad.type === 'linear') {
            cssGrad = `linear-gradient(${grad.angle || 135}deg, ${colors})`;
          } else if (grad.type === 'radial') {
            cssGrad = `radial-gradient(circle, ${colors})`;
          } else {
            cssGrad = `conic-gradient(${colors})`;
          }
          mainSpan.style.background = cssGrad;
          mainSpan.style.webkitBackgroundClip = 'text';
          mainSpan.style.webkitTextFillColor = 'transparent';
        } else {
          mainSpan.style.background = '';
          mainSpan.style.webkitBackgroundClip = '';
          mainSpan.style.webkitTextFillColor = '';
        }
      }

      // Glitch color shift layers
      if (activeAnim && activeAnim.options.effect === 'glitch' && Math.random() > 0.6) {
        rLayer.style.opacity = '0.8';
        bLayer.style.opacity = '0.8';
        const shiftX = (Math.random() - 0.5) * 8;
        const shiftY = (Math.random() - 0.5) * 2;
        rLayer.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
        bLayer.style.transform = `translate3d(${-shiftX}px, ${-shiftY}px, 0)`;
      } else {
        rLayer.style.opacity = '0';
        bLayer.style.opacity = '0';
        rLayer.style.transform = 'translate3d(0, 0, 0)';
        bLayer.style.transform = 'translate3d(0, 0, 0)';
      }

      if (state.char && mainSpan.textContent !== state.char) {
        mainSpan.textContent = state.char === ' ' ? '\u00A0' : state.char;
        rLayer.textContent = mainSpan.textContent;
        bLayer.textContent = mainSpan.textContent;
      }
    }
    return performance.now() - startTime;
  }

  dispose(): void {
    this.container.innerHTML = '';
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export class Canvas2DRenderer implements Renderer {
  public container: HTMLElement;
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public glyphs: { char: string; index: number }[] = [];
  public width = 0;
  public height = 0;
  
  private particles: Particle[] = [];
  private maxParticles = 500;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas2DRenderer: Failed to get 2D context');
    }
    this.ctx = context;

    this.particles = Array.from({ length: this.maxParticles }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, size: 2, color: '#ffffff', alpha: 1, life: 0, maxLife: 0, active: false
    }));
  }

  mount(text: string): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.resize();

    this.glyphs = text.split('').map((char, index) => ({
      char,
      index
    }));
  }

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
  }

  private spawnParticle(x: number, y: number, vx: number, vy: number, size: number, color: string, life: number) {
    const p = this.particles.find(part => !part.active);
    if (p) {
      p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.size = size; p.color = color;
      p.alpha = 1.0; p.life = life; p.maxLife = life; p.active = true;
    }
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    const activeAnim = Anomotion.activeInstance;
    const effect = activeAnim?.options.effect || '';
    const style = activeAnim?.options.style;
    
    // Clear and draw background
    if (style && style.background) {
      this.ctx.fillStyle = style.background;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else if (effect === 'grainReveal') {
      this.ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    if (effect === 'grainReveal') {
      const intensity = activeAnim?.options.grainIntensity ?? 0.15;
      const size = activeAnim?.options.grainSize ?? 2.0;
      this.ctx.fillStyle = '#ffffff';
      for (let g = 0; g < 300; g++) {
        if (Math.random() < intensity) {
          this.ctx.fillRect(Math.random() * this.width, Math.random() * this.height, size, size);
        }
      }
    }

    // Apply baseline styles
    this.ctx.font = '800 4rem "Outfit", sans-serif';
    this.ctx.fillStyle = style?.textColor || '#f3f4f6';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textWidth = this.ctx.measureText(this.glyphs.map(g => g.char).join('')).width;
    let currentX = (this.width - textWidth) / 2;
    const centerY = this.height / 2;

    // Draw active particles
    for (const p of this.particles) {
      if (p.active) {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.016;
        p.alpha = Math.max(0, p.life / p.maxLife);
        
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        if (p.life <= 0) p.active = false;
      }
    }

    // Create Canvas Gradients once across the entire text bounding area
    let textGradient: CanvasGradient | null = null;
    if (style && style.gradient) {
      const grad = style.gradient;
      if (grad.type === 'linear') {
        textGradient = this.ctx.createLinearGradient(currentX, centerY, currentX + textWidth, centerY);
      } else {
        textGradient = this.ctx.createRadialGradient(
          currentX + textWidth / 2, centerY, 5,
          currentX + textWidth / 2, centerY, textWidth / 2
        );
      }

      if (grad.stops) {
        grad.stops.forEach(s => textGradient!.addColorStop(s.offset, s.color));
      } else {
        grad.colors.forEach((col, idx) => {
          textGradient!.addColorStop(idx / (grad.colors.length - 1 || 1), col);
        });
      }
    }

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const state = states[i];
      if (!state) continue;

      const charWidth = this.ctx.measureText(glyph.char).width;
      const x = currentX + charWidth / 2 + state.x;
      const y = centerY + state.y;
      const displayChar = state.char || glyph.char;

      if (effect === 'sparkText' && Math.random() > 0.3) {
        const spColor = activeAnim?.options.sparkColor || '#ffaa00';
        this.spawnParticle(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2 - 1,
          Math.random() * 2 + 1,
          spColor,
          0.8
        );
      }

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.scale(state.scaleX, state.scaleY);
      this.ctx.rotate(state.rotation * Math.PI / 180);
      this.ctx.globalAlpha = state.opacity;

      // Apply Canvas Shadows / Glows
      if (style) {
        if (style.shadow) {
          this.ctx.shadowColor = style.shadow.color;
          this.ctx.shadowOffsetX = style.shadow.offsetX;
          this.ctx.shadowOffsetY = style.shadow.offsetY;
          this.ctx.shadowBlur = style.shadow.blur;
        } else if (style.glow) {
          this.ctx.shadowColor = style.glow.color;
          this.ctx.shadowBlur = style.glow.radius;
        }
      }

      if (effect === 'fluidText') {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = activeAnim?.options.colorDiffusion || '#0070f3';
      }

      // Draw text with Gradient or flat Color
      this.ctx.fillStyle = textGradient || state.color || style?.textColor || '#ffffff';

      if (effect === 'pixelate') {
        const initSize = activeAnim?.options.initialPixelSize ?? 16;
        const curT = activeAnim?.currentTime ?? 0;
        const dur = activeAnim?.options.duration ?? 1.0;
        const pixelSize = Math.max(1, Math.round(initSize * (1 - (curT / dur))));
        
        if (pixelSize > 1) {
          const shape = activeAnim?.options.pixelShape || 'square';
          if (shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, charWidth / 2, 0, Math.PI * 2);
            this.ctx.fill();
          } else {
            this.ctx.fillRect(-charWidth / 2, -charWidth / 2, charWidth, charWidth);
          }
        } else {
          this.ctx.fillText(displayChar, 0, 0);
        }
      } else {
        this.ctx.fillText(displayChar, 0, 0);
      }

      this.ctx.restore();
      currentX += charWidth;
    }

    return performance.now() - startTime;
  }

  dispose(): void {
    this.canvas.remove();
    this.container.innerHTML = '';
  }
}

Anomotion.registerRenderer('dom', DomRenderer);
Anomotion.registerRenderer('canvas', Canvas2DRenderer);
