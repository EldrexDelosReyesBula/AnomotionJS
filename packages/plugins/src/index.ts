import { Plugin, Anomotion } from '@eldrex/anomotionjs-core';

/**
 * GSAP Timeline Adapter Plugin
 * Maps external GSAP timeline triggers onto internal Anomotion loops
 */
export const GsapPlugin: Plugin = {
  name: 'gsap-adapter',
  install(core: any) {
    const originalCreate = core.create.bind(core);
    core.create = (selector: any, options: any) => {
      const anim = originalCreate(selector, options);
      // Hook custom updates into external GSAP timeline if present
      if (anim && (window as any).gsap) {
        const gsap = (window as any).gsap;
        // Map elements directly to GSAP tweens
        const elements = anim.renderer.glyphs.map((g: any) => g.element).filter(Boolean);
        if (elements.length > 0) {
          gsap.fromTo(elements, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: options?.duration || 1.5, ease: 'power2.out' }
          );
        }
      }
      return anim;
    };
  }
};

/**
 * SVG Text Path Animator Plugin
 * Animates characters along specified SVG paths
 */
export const SVGPathPlugin: Plugin = {
  name: 'svg-path',
  install(core: any) {
    // Extends core with SVG animation helpers
    (core as any).animateOnPath = (selector: string, pathSelector: string) => {
      const pathEl = document.querySelector(pathSelector) as SVGPathElement | null;
      if (!pathEl) {
        console.error('Anomotion: Target SVG path not found.');
        return;
      }
      
      const totalLen = pathEl.getTotalLength();
      const anim = core.create(selector, { loop: true });
      
      if (anim) {
        const glyphsCount = anim.renderer.glyphs.length;
        // Hook into ticks to position glyphs along SVG coordinate paths
        const originalUpdate = anim.update.bind(anim);
        anim.update = (time: number) => {
          const res = originalUpdate(time);
          const elapsed = (time - (anim as any).startTime) / 1000;
          
          for (let i = 0; i < anim.states.length; i++) {
            const state = anim.states[i];
            const pct = ((elapsed * 0.1) + (i / glyphsCount)) % 1.0;
            const pt = pathEl.getPointAtLength(pct * totalLen);
            state.x = pt.x;
            state.y = pt.y;
          }
          return res;
        };
      }
      return anim;
    };
  }
};

// Register official plugins automatically
Anomotion.use(GsapPlugin);
Anomotion.use(SVGPathPlugin);
