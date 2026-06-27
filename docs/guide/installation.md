# Installation Guide

AnomotionJS is highly modularized. You can install only the core engine and add the specific renderers and extensions your project requires.

---

## 1. Package Manager Installation

Install the core package along with your preferred renderer using any of the major package managers:

### NPM
```bash
npm install @eldrex/anomotionjs-core @eldrex/anomotionjs-renderer-2d
```

### PNPM
```bash
pnpm add @eldrex/anomotionjs-core @eldrex/anomotionjs-renderer-2d
```

### Yarn
```bash
yarn add @eldrex/anomotionjs-core @eldrex/anomotionjs-renderer-2d
```

---

## 2. Advanced Renderers & Modules

Depending on your rendering environment, you can install specialized packages:

| Package | Description | Target Surface |
| :--- | :--- | :--- |
| `@eldrex/anomotionjs-core` | Core animation state engine & timeline loop | Core engine (Required) |
| `@eldrex/anomotionjs-renderer-2d` | DOM and HTML5 Canvas 2D renderers | Standard browser elements |
| `@eldrex/anomotionjs-renderer-3d` | Three.js WebGL rendering context | 3D Text geometry / WebGL scenes |
| `@eldrex/anomotionjs-physics` | Verlet Integration physics & forces plugin | Particles / Elastic Text motions |
| `@eldrex/anomotionjs-plugins` | GSAP timelines and SVG path pathing adapters | Advanced orchestrations |

---

## 3. Direct CDN Integration (Zero-Build Setup)

For quick prototyping, code sandboxes (like CodePen or JSFiddle), or direct HTML inclusions, load the modules as modern ES Modules using `esm.sh`:

```html
<div id="hero">ANOMOTION JS</div>

<script type="module">
  import Anomotion from 'https://esm.sh/@eldrex/anomotionjs-core@1.0.1';
  import 'https://esm.sh/@eldrex/anomotionjs-renderer-2d@1.0.1';

  Anomotion.create('#hero', {
    effect: 'wave',
    duration: 1.8,
    loop: true
  });
</script>
```

---

## 4. Offline Bootloader Caching (High Performance)

AnomotionJS provides an offline-first bootloader. This lets you serve the core script from an IndexedDB database on your user's machine, eliminating network bottlenecks entirely on subsequent visits:

```html
<!-- 1. Include the Anomotion Caching Bootloader -->
<script src="https://cdn.jsdelivr.net/npm/@eldrex/anomotionjs-cache@1.0.1/dist/index.js"></script>

<!-- 2. Initialize Safe, Offline-Independent Boot -->
<script>
  AnomotionBootloader.ready('1.0.1').then(() => {
    console.log('Anomotion is loaded and cached offline!');
    Anomotion.create('#target-element', {
      effect: 'reveal',
      duration: 1.5
    });
  });
</script>
```
For more information on configuring offline capabilities, read the [Offline & Caching Guide](./offline-caching).
