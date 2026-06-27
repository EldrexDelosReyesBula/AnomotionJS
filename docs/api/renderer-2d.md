# Renderer 2D API Reference

The `@eldrex/anomotionjs-renderer-2d` package implements high-performance DOM/CSS and HTML5 Canvas 2D drawing contexts.

---

## 1. Class: `DomRenderer`

Applies animation states onto HTML elements using hardware-accelerated CSS 3D transforms.

### Constructor
```javascript
const renderer = new DomRenderer(container);
```
- **Parameters:**
  - `container: HTMLElement` — The target wrapping element.

### Properties
- `container: HTMLElement` — The container element reference.
- `glyphs: { element: HTMLElement, char: string }[]` — The live array of mapped character span nodes.

### Methods
- `mount(text)` — Segments and injects HTML character spans into the container.
- `render(states)` — Applies translations, scale, rotation, filter, and opacity styles onto each character element. Returns rendering calculation duration in milliseconds.
- `dispose()` — Clears HTML contents and disposes reference lists.

---

## 2. Class: `Canvas2DRenderer`

Draws character animations on an HTML5 Canvas drawing context, bypassing DOM manipulation overhead.

### Constructor
```javascript
const renderer = new Canvas2DRenderer(container);
```
- **Parameters:**
  - `container: HTMLElement` — The target wrapping element.

### Properties
- `container: HTMLElement` — The container element reference.
- `canvas: HTMLCanvasElement` — The created drawing canvas element.
- `glyphs: { char: string, index: number }[]` — Mapped character lists.
- `width: number` — Real viewport width.
- `height: number` — Real viewport height.

### Methods
- `mount(text)` — Attaches the canvas element and prepares glyph indexes.
- `resize()` — Dynamically resizes the canvas drawing buffer based on device pixel ratio (DPR) to prevent blurring.
- `render(states)` — Clears screen context and draws character states at calculated coordinate offsets. Returns rendering calculation duration in milliseconds.
- `dispose()` — Removes the canvas element from the DOM.
