# Getting Started with AnomotionJS

AnomotionJS is a high-performance, modular, and offline-first text animation engine. It allows developers to create stunning, interactive typography motions across DOM/CSS, Canvas 2D, Three.js WebGL, and WebGPU backends with a unified, lightweight API.

---

## 1. Quick Installation

Install the core package and renderer modules via npm:

```bash
npm install @eldrex/anomotionjs-core @eldrex/anomotionjs-renderer-2d
```

### Direct CDN Integration (Offline-First)

To achieve maximum performance and offline functionality, include our inline IndexedDB loader snippet directly in your HTML `<head>`:

```html
<!-- 1. The Anomotion Caching Bootloader -->
<script src="https://cdn.jsdelivr.net/npm/@eldrex/anomotionjs-cache@1.0.1/dist/index.js"></script>

<!-- 2. Safe, Network-Independent Execution -->
<script>
  AnomotionBootloader.ready('1.0.1').then(() => {
    Anomotion.create('#hero-title', {
      effect: 'wave',
      duration: 1.8,
      easing: 'easeOutElastic'
    });
  });
</script>
```

---

## 2. Basic Example

Create a container element in your HTML:

```html
<div class="my-text-element">ANOMOTION ENGINE</div>
```

Initialize your first text animation pipeline:

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Registers DOM & Canvas 2D renderers automatically

const animation = Anomotion.create('.my-text-element', {
  effect: 'wave',
  duration: 1.5,
  stagger: 40,
  easing: 'easeOutElastic',
  loop: true
});
```

---

## 3. Interactive Playback Controls

AnomotionJS supports predictable timeline controls modeled after Anime.js:

```javascript
// Pause the animation loop
animation.paused = true;

// Play backwards
animation.reversed = true;

// Reset loop back to start frame
animation.currentTime = 0;
```

---

## 4. Verlet Physics Simulation

To enable spring systems, gravity, or interactive mouse force vectors, import the physics plugin:

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d';
import '@eldrex/anomotionjs-physics'; // Extends creation pipelines with physical attributes

const physicsAnim = Anomotion.create('.physics-target', {
  effect: 'float',
  duration: 2.0,
  physics: true // Enables physical force simulations
});

// Configure active forces on the fly
physicsAnim.physicsInstance.forceType = 'spring'; // Options: 'spring', 'gravity', 'attract', 'repel'
physicsAnim.physicsInstance.stiffness = 0.08;
physicsAnim.physicsInstance.damping = 0.92;
```
