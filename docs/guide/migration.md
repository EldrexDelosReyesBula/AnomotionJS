# Migration Guide

Upgrading legacy installations to the new monorepo scoped version of AnomotionJS is simple. This guide outlines namespace overrides, import updates, and migration from Glitch v1 to Glitch v2.

---

## 1. Scoped Namespace Packages

Historically, all classes were bundled inside a single `anomotion` library. To optimize bundle tree-shaking, these have been decomposed into scoped NPM packages:

```diff
- import Anomotion from 'anomotion';
+ import Anomotion from '@eldrex/anomotionjs-core';
+ import '@eldrex/anomotionjs-renderer-2d';
```

---

## 2. Dependency Matrix Mapping

Update your package dependency maps in `package.json`:

| Legacy Package API | Scoped Monorepo Equivalent | Installation |
| :--- | :--- | :--- |
| `anomotion` (Core) | `@eldrex/anomotionjs-core` | `npm install @eldrex/anomotionjs-core` |
| `anomotion` (DOM/Canvas) | `@eldrex/anomotionjs-renderer-2d` | `npm install @eldrex/anomotionjs-renderer-2d` |
| `anomotion` (ThreeJS) | `@eldrex/anomotionjs-renderer-3d` | `npm install @eldrex/anomotionjs-renderer-3d` |
| `anomotion-cache` | `@eldrex/anomotionjs-cache` | `npm install @eldrex/anomotionjs-cache` |

---

## 3. Glitch v1 to Glitch v2 Migration

The glitch animation effect has been completely rewritten in **v1.0.2** to resolve screen flicker, allow deterministic animations, and support accessibility standards.

### Summary of Changes

| Feature | Glitch v1 | Glitch v2 |
|---------|-----------|-----------|
| **Flicker Control** | Jarring layout reflows (updating `top`/`left`) | Zero reflow. GPU-accelerated layers with `will-change: transform`. |
| **Color Shifts** | Hard color changes | Independent sub-layers using CSS `mix-blend-mode: screen`. |
| **RNG Randomness** | Uncontrolled `Math.random()` | Seed-based RNG for identical playback. |
| **Accessibility** | Flickered regardless of systems | Respects system-level `prefers-reduced-motion` settings. |

### API Signature Migration

#### Legacy API (v1.0.1)
```javascript
Anomotion.create('.text', {
  effect: 'glitch',
  glitchColor: '#ff0055'
});
```

#### New API (v1.0.2)
```javascript
Anomotion.create('.text', {
  effect: 'glitch',
  glitchIntensity: 0.3,
  glitchTiming: 'triggered', // 'triggered' | 'periodic' | 'continuous'
  seed: 42,
  colorChannels: ['#ff0055', '#00ffaa', '#0070f3'],
  exitDuration: 0.5
});
```

---

## 4. Registering Renderers

Renderers must be imported to auto-register:

### HTML/DOM Renderer
```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Registers 'dom' & 'canvas'

Anomotion.create('#header', {
  renderer: 'dom',
  effect: 'wave'
});
```

### Three.js Renderer
```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-3d'; // Registers 'three'

Anomotion.create('#canvas3d', {
  renderer: 'three',
  effect: 'vortex'
});
```
