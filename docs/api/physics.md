# Physics API Reference

The `@eldrex/anomotionjs-physics` package layers interactive Verlet particle simulations on top of coordinates.

---

## 1. Class: `PhysicsModule`

Runs elastic force equations and coordinates particle updates.

### Constructor
```javascript
const physics = new PhysicsModule(glyphsCount);
```
- **Parameters:**
  - `glyphsCount: number` — The number of characters to simulate.

### Properties
- `particles: Particle[]` — List of active particles containing position, velocity, mass, and target coordinate anchors.
- `stiffness: number` — Tension multiplier of the virtual springs (Default: `0.08`).
- `damping: number` — Friction multiplier reducing kinetic energy over time (Default: `0.92`).
- `forceType: 'spring' | 'gravity' | 'attract' | 'repel'` — Active force solver (Default: `'spring'`).
- `mousePos: { x: number | null, y: number | null }` — Live cursor coordinates.

### Methods
- `update(states, elapsed)` — Computes spring tensions, gravity, or interactive mouse displacement forces. Translates calculations onto active `GlyphState` offsets.

---

## 2. Object: `PhysicsPlugin`

The plugin adapter that registers hooks inside Anomotion core to spawn a `PhysicsModule` automatically on demand.

- **Usage:**
  ```javascript
  import Anomotion from '@eldrex/anomotionjs-core';
  import '@eldrex/anomotionjs-physics'; // Installs and auto-registers PhysicsPlugin

  Anomotion.create('#element', {
    physics: true // Automatically instantiates PhysicsModule
  });
  ```
