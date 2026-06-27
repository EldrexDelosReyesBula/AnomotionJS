# Migration Guide

Upgrading legacy installations to the new monorepo scoped version of AnomotionJS is simple. This guide outlines namespace overrides, import updates, and architectural changes.

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

## 3. Registering Renderers

In previous versions, renderers were loaded automatically inside the main bundle. To reduce output file sizes in simple setups, renderers must now be imported to auto-register:

### HTML/DOM Renderer
```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Must import to auto-register 'dom' & 'canvas'

Anomotion.create('#header', {
  renderer: 'dom', // Now registered
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
