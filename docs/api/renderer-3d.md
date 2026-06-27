# Renderer 3D API Reference

The `@eldrex/anomotionjs-renderer-3d` package implements a WebGL rendering context using Three.js and Troika Text.

---

## 1. Class: `ThreeRenderer`

Initializes WebGL scenes, cameras, ambient lights, and render pipelines to animate 3D text.

### Constructor
```javascript
const renderer = new ThreeRenderer(container);
```
- **Parameters:**
  - `container: HTMLElement` — The target wrapper element.

### Properties
- `container: HTMLElement` — The container element reference.
- `scene: THREE.Scene` — The instantiated Three.js scene container.
- `camera: THREE.PerspectiveCamera` — Perspective camera capturing the scene.
- `renderer: THREE.WebGLRenderer` — WebGL context renderer.
- `glyphs: { index: number, char: string }[]` — Internal parsed character maps.

### Methods

#### `mount(text)`
Prepares 3D geometries, mounts Troika-three-text nodes, and anchors coordinates.
- **Parameters:**
  - `text: string` — Text content to display.

#### `render(states)`
Resolves offsets from states, applies coordinate shifts (inverting Y for WebGL coordinates), maps color hex codes dynamically, and renders frames.
- **Parameters:**
  - `states: GlyphState[]` — Live character states.
- **Returns:** `number` — Rendering calculation duration in milliseconds.

#### `resize()`
Recalculates aspect ratios and update projection matrices dynamically when parent dimensions alter.

#### `dispose()`
Removes lighting, meshes, and WebGL contexts, freeing GPU memory.
