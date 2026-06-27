import { Renderer, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';
import { TextParser } from '@eldrex/anomotionjs-text';

export class DomRenderer implements Renderer {
  public container: HTMLElement;
  public glyphs: { element: HTMLElement; char: string }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(text: string): void {
    const elements = TextParser.injectDOMSpans(this.container, text);
    this.glyphs = elements.map((element) => ({
      element,
      char: element.textContent || ''
    }));
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const state = states[i];
      if (!state) continue;

      const element = glyph.element;
      const transform = `translate3d(${state.x}px, ${state.y}px, ${state.z || 0}px) rotate(${state.rotation}deg) scale(${state.scaleX}, ${state.scaleY})`;
      element.style.transform = transform;
      element.style.opacity = state.opacity.toString();
      
      if (state.filter) {
        element.style.filter = state.filter;
      }
    }
    return performance.now() - startTime;
  }

  dispose(): void {
    this.container.innerHTML = '';
  }
}

export class Canvas2DRenderer implements Renderer {
  public container: HTMLElement;
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public glyphs: { char: string; index: number }[] = [];
  public width = 0;
  public height = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas2DRenderer: Failed to get 2D context');
    }
    this.ctx = context;
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

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Apply baseline styles
    this.ctx.font = '800 4rem "Outfit", sans-serif';
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textWidth = this.ctx.measureText(this.glyphs.map(g => g.char).join('')).width;
    let currentX = (this.width - textWidth) / 2;
    const centerY = this.height / 2;

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const state = states[i];
      if (!state) continue;

      const charWidth = this.ctx.measureText(glyph.char).width;
      const x = currentX + charWidth / 2 + state.x;
      const y = centerY + state.y;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.scale(state.scaleX, state.scaleY);
      this.ctx.rotate(state.rotation * Math.PI / 180);
      this.ctx.globalAlpha = state.opacity;

      this.ctx.fillText(glyph.char, 0, 0);
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

// Auto-register default 2D renderers within Anomotion
Anomotion.registerRenderer('dom', DomRenderer);
Anomotion.registerRenderer('canvas', Canvas2DRenderer);
