# Custom Plugins & Renderers

AnomotionJS is fully extensible. You can hook into the central core engine loop to build custom animations, create custom renderer backends, or adapt third-party libraries (like GSAP or Anime.js) into the pipeline.

---

## 1. Writing a Core Plugin

A plugin is an object satisfying the `Plugin` interface:
```typescript
interface Plugin {
  name: string;
  install(core: typeof Anomotion): void;
}
```

Here is a complete example of a custom plugin that adds a diagnostic logging hook to every created animation instance:

```javascript
import Anomotion from '@eldrex/anomotionjs-core';

// 1. Define the Custom Plugin
const LoggerPlugin = {
  name: 'animation-logger',
  install(core) {
    // Intercept core creation
    const originalCreate = core.create.bind(core);
    
    core.create = (selector, options) => {
      console.log(`[Anomotion] Instantiating animation on target: ${selector}`);
      const anim = originalCreate(selector, options);
      
      if (anim) {
        // Hook into the tick updater
        const originalUpdate = anim.update.bind(anim);
        anim.update = (time) => {
          const finished = originalUpdate(time);
          console.log(`[Anomotion Tick] Time: ${anim.currentTime.toFixed(2)}s`);
          return finished;
        };
      }
      
      return anim;
    };
  }
};

// 2. Install the Plugin
Anomotion.use(LoggerPlugin);
```

---

## 2. Writing a Custom Renderer

Renderers must implement the `Renderer` interface:
```typescript
interface Renderer {
  container?: HTMLElement;
  glyphs: any[];
  mount(text: string): void;
  render(states: GlyphState[]): number; // Returns render duration in milliseconds
  dispose(): void;
}
```

Here is a skeleton implementation of a custom console-based renderer (great for testing environments):

```javascript
class ConsoleRenderer {
  constructor(container) {
    this.container = container;
    this.glyphs = [];
  }

  mount(text) {
    this.glyphs = text.split('').map((char, index) => ({ char, index }));
    console.log(`[ConsoleRenderer] Mounted text: "${text}"`);
  }

  render(states) {
    const start = performance.now();
    const renderOutput = this.glyphs.map((g, idx) => {
      const state = states[idx];
      return `${g.char}(Y:${state.y.toFixed(0)}px)`;
    }).join(' ');
    
    console.clear();
    console.log(renderOutput);
    return performance.now() - start;
  }

  dispose() {
    console.log('[ConsoleRenderer] Disposed.');
  }
}

// Register the custom renderer with Anomotion
Anomotion.registerRenderer('console', ConsoleRenderer);

// Run an animation using it
Anomotion.create(document.body, {
  renderer: 'console',
  text: 'HELO',
  effect: 'wave'
});
```
For deep-dives into the APIs, check out the [Plugins API Reference](../api/plugins-api).
