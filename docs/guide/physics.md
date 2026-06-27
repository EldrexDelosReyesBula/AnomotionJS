# Physics Simulation Guide

AnomotionJS features a high-performance physics plugin powered by Verlet Integration. When activated, it transforms characters into elastic particles that interact dynamically with mouse movements and respond to spring forces or gravity.

---

## 1. How It Works

Traditional keyframe animations are deterministic—they look identical every time. By layering a physics simulation:
- Calculations resolve character positions dynamically using velocity, acceleration, and damping.
- Elasticity, inertia, and bounds constraints make motions feel organic.
- Characters react to user input (like mouse push or pull forces) in real time.

---

## 2. Enabling Physics

To activate physics, install or import `@eldrex/anomotionjs-physics` and configure `physics: true` in your animation options:

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d';
import '@eldrex/anomotionjs-physics'; // Imports and auto-registers PhysicsPlugin

const anim = Anomotion.create('#target', {
  effect: 'wave',
  physics: true,    // Enable physics engine for this instance
  duration: 2.0,
  loop: true
});
```

---

## 3. Configuring Physics Properties

The `physicsInstance` exposed on your animation runner allows you to customize simulation metrics:

```javascript
const anim = Anomotion.create('#target', {
  effect: 'float',
  physics: true
});

if (anim.physicsInstance) {
  // Alter force solvers: 'spring' | 'gravity' | 'attract' | 'repel'
  anim.physicsInstance.forceType = 'spring';

  // Elastic tension multiplier (Default: 0.08)
  anim.physicsInstance.stiffness = 0.12;

  // Velocity friction drag (Default: 0.92)
  anim.physicsInstance.damping = 0.88;
}
```

---

## 4. Interactive Solvers Catalog

### Spring Force (`spring`)
Characters behave like particles connected by invisible springs to their home coordinate anchors. They bounce back elastically when displaced by mouse movements.

### Gravity Force (`gravity`)
Simulates gravitational acceleration. Characters fall downward until they hit a defined floor constraint, bouncing realistically upon impact.

### Mouse Attract / Repel (`attract` / `repel`)
Displaces characters based on the client cursor position.
- **`repel`**: Pushes characters away from the mouse, creating a physical "bubble" boundary.
- **`attract`**: Pulls characters toward the cursor as it moves nearby.
- Enabled automatically when `mouseInteraction: true` (default).
