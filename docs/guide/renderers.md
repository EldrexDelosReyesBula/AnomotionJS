# Renderers Comparison Guide

AnomotionJS abstractly decouples animation states from the actual drawing processes. Renderers are modular plugins that write calculated positioning structures onto specific visual surfaces.

---

## 1. Renderer Comparison Matrix

Choose the appropriate renderer based on your visual layout complexity and target platform performance profile:

| Feature / Metric | DOM Renderer (`dom`) | Canvas 2D Renderer (`canvas`) | WebGL Renderer (`three`) | WebGPU Renderer (`webgpu`) |
| :--- | :--- | :--- | :--- | :--- |
| **Drawing Engine** | CSS 3D Transforms | HTML5 Canvas Context | Three.js / WebGL | Modern WebGPU API |
| **Perf Limit** | ~100 characters | ~2,000 characters | ~10,000+ characters | ~50,000+ characters |
| **Aesthetics** | HTML fonts, text-shadow | Vector fills, custom gradients | 3D geometries, materials, lighting | Compute shaders, custom post-process |
| **SEO Indexable** | Yes (Original text remains crawlable) | No | No | No |
| **Layout Styling** | Native CSS / Flexbox / Grid | Programmatic coordinates | 3D space scene offsets | GPU Buffer bindings |
| **Best Used For** | UI headers, body text, link motions | Heavy particle text, banner graphics | 3D games, immersive landing screens | Next-generation WebGPU visualizers |

---

## 2. Using the DOM Renderer (`dom`)

The DOM renderer wraps each word and letter in separate `<span>` tags. It updates CSS properties using standard 3D transforms (`translate3d()`, `rotate()`, `scale()`).

- **Pros:** Text remains indexable by search engines (great for SEO); scales automatically with native responsive layouts.
- **Cons:** Performance degrades if animating long paragraphs (high DOM mutation overhead).

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Registers 'dom'

Anomotion.create('#element', {
  renderer: 'dom', // Default
  effect: 'wave'
});
```

---

## 3. Using the Canvas 2D Renderer (`canvas`)

The Canvas renderer creates an `<canvas>` element and clears/draws letters on a 2D pixel grid during each tick.

- **Pros:** Can animate hundreds of characters simultaneously at 60fps; avoids DOM paint overhead.
- **Cons:** Text is not indexable; requires manual canvas resizing logic (handled automatically by AnomotionJS).

```javascript
Anomotion.create('#canvas-container', {
  renderer: 'canvas',
  effect: 'explode'
});
```

---

## 4. Using the WebGL Renderer (`three`)

Generates a Three.js scene and renders text as 3D meshes or flat textures inside WebGL space.

- **Pros:** Seamless integration with existing 3D websites; supports depth, lights, cameras, and physical materials.
- **Cons:** Heavy dependency bundle size (requires `three` and `troika-three-text`).

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-3d'; // Registers 'three'

Anomotion.create('#three-container', {
  renderer: 'three',
  effect: 'vortex'
});
```
