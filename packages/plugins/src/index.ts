import { Plugin, Anomotion, AnimationOptions, TextAnimation } from '@eldrex/anomotionjs-core';

/**
 * GSAP Timeline Adapter Plugin
 * Maps external GSAP timeline triggers onto internal Anomotion loops
 */
export const GsapPlugin: Plugin = {
  name: 'gsap-adapter',
  install(core: any) {
    if (typeof window !== 'undefined' && (window as any).gsap) {
      const gsap = (window as any).gsap;
      try {
        // Remove GSAP automatic tick loop
        gsap.ticker.remove(gsap.update);
      } catch (e) {}

      // Inject manual tick into Anomotion globalLoop
      const loop = core.globalLoop;
      if (loop && !loop._gsapPatched) {
        loop._gsapPatched = true;
        const originalTick = loop.tick;
        loop.tick = function(time: number) {
          try {
            // Tick GSAP timeline manual update
            gsap.update(time / 1000);
          } catch (e) {}
          originalTick.call(this, time);
        };
      }
    }

    const originalCreate = core.create.bind(core);
    core.create = (selector: any, options: any) => {
      const anim = originalCreate(selector, options);
      if (anim && typeof window !== 'undefined' && (window as any).gsap) {
        const gsap = (window as any).gsap;
        const elements = anim.renderer.glyphs.map((g: any) => g.element).filter(Boolean);
        if (elements.length > 0) {
          const timeline = gsap.timeline();
          timeline.fromTo(elements, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: options?.duration || 1.5, ease: 'power2.out' }
          );
          
          // Dispose GSAP timeline when Anomotion animation is destroyed
          const originalDestroy = anim.destroy.bind(anim);
          anim.destroy = () => {
            timeline.kill();
            originalDestroy();
          };
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

// ─── FRAMEWORK WRAPPERS ──────────────────────────────────────────────────────

// React hook
export function useAnomotion(
  ref: { current: HTMLElement | null },
  config: AnimationOptions
): TextAnimation | null {
  // Lazy evaluation to run only in browser/client
  if (typeof window === 'undefined') return null;
  
  let anim: TextAnimation | null = null;
  const init = () => {
    if (ref.current) {
      anim = Anomotion.create(ref.current, config);
    }
  };

  // Safe client-side setup
  setTimeout(init, 0);

  return anim;
}

// Vue 3 Composable
export function useAnomotionVue(
  targetRef: { value: HTMLElement | null },
  config: AnimationOptions
) {
  let anim: TextAnimation | null = null;
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      if (targetRef.value) {
        anim = Anomotion.create(targetRef.value, config);
      }
    }, 0);
  }

  return {
    destroy: () => anim?.destroy()
  };
}

// Svelte action
export function anomotionAction(node: HTMLElement, config: AnimationOptions) {
  let anim = Anomotion.create(node, config);
  return {
    update(newConfig: AnimationOptions) {
      if (anim) anim.destroy();
      anim = Anomotion.create(node, newConfig);
    },
    destroy() {
      if (anim) anim.destroy();
    }
  };
}

// Angular Directive Mock / NgZone Wrapper
export class AnomotionAngularHelper {
  private anim: TextAnimation | null = null;

  constructor(private el: any, private ngZone: any) {}

  init(config: AnimationOptions) {
    if (this.ngZone) {
      this.ngZone.runOutsideAngular(() => {
        this.anim = Anomotion.create(this.el, config);
      });
    } else {
      this.anim = Anomotion.create(this.el, config);
    }
  }

  destroy() {
    if (this.anim) {
      this.anim.destroy();
    }
  }
}

// ─── BUILD BUNDLER PLUGINS ───────────────────────────────────────────────────

// Vite Plugin
export function anomotionVitePlugin(options?: { version?: string }) {
  const version = options?.version || '1.0.2';
  return {
    name: 'anomotion-vite-plugin',
    transformIndexHtml(html: string) {
      return html.replace(
        '</head>',
        `  <script type="module">
    import { AnomotionBootloader } from 'https://esm.sh/@eldrex/anomotionjs-cache@${version}';
    AnomotionBootloader.warm('${version}');
  </script>
</head>`
      );
    }
  };
}

// Webpack Plugin
export class AnomotionWebpackPlugin {
  private version: string;
  constructor(options?: { version?: string }) {
    this.version = options?.version || '1.0.2';
  }

  apply(compiler: any) {
    compiler.hooks.compilation.tap('AnomotionWebpackPlugin', (compilation: any) => {
      (compilation.hooks as any).htmlWebpackPluginBeforeHtmlProcessing?.tap('AnomotionWebpackPlugin', (htmlPluginData: any) => {
        htmlPluginData.html = htmlPluginData.html.replace(
          '</head>',
          `  <script type="module">
    import { AnomotionBootloader } from 'https://esm.sh/@eldrex/anomotionjs-cache@${this.version}';
    AnomotionBootloader.warm('${this.version}');
  </script>
</head>`
        );
      });
    });
  }
}

// Auto-register official plugins
Anomotion.use(GsapPlugin);
Anomotion.use(SVGPathPlugin);
