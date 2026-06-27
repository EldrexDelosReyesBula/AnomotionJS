# Verlet Physics in Web Animations

In web animations, we often want things to look organic rather than mechanical. Standard ease functions are great, but they are deterministic. Adding a physics simulation makes interactions feel elastic, heavy, and responsive.

This article details the math and implementation of **Verlet Integration**, a high-performance numerical method used to animate physical particles and constraints in web browsers.

---

## 1. Why Verlet Integration?

Most developers are familiar with **Euler Integration** for physics:
```javascript
// Euler Integration
velocity += acceleration * dt;
position += velocity * dt;
```

### The Problem with Euler:
- **Numerical Instability:** If the frame delta ($dt$) fluctuates (common in browsers due to garbage collection or background tasks), velocities quickly drift out of bounds.
- **Spring Collapses:** Systems under high tension (like tight springs) can accumulate infinite energy and explode.

**Verlet Integration** resolves this by deriving velocity implicitly from the particle's **current position** and **previous position**, making it incredibly stable and self-correcting:

```javascript
// Verlet Integration
const velocity = position - previousPosition;
previousPosition = position;
position += velocity + acceleration * dt * dt;
```

---

## 2. The Math Behind Verlet

Verlet integration derives from Taylor series expansion equations. In code, the update loop for a particle is implemented as follows:

```typescript
interface Particle {
  x: number;   // Current X position
  y: number;   // Current Y position
  px: number;  // Previous X position
  py: number;  // Previous Y position
  ax: number;  // Current X acceleration
  ay: number;  // Current Y acceleration
}

function update(p: Particle, damping: number, dt: number) {
  // 1. Calculate implicit velocity (with damping friction)
  const vx = (p.x - p.px) * damping;
  const vy = (p.y - p.py) * damping;

  // 2. Store current position as previous
  p.px = p.x;
  p.py = p.y;

  // 3. Move particle forward using velocity and acceleration
  p.x += vx + p.ax * dt * dt;
  p.y += vy + p.ay * dt * dt;
}
```

- If a particle is pushed externally, we don't adjust its velocity; we simply alter its `x` and `y` coordinates. The Verlet algorithm naturally resolves the resulting velocity in the next frame.

---

## 3. Implementing Elastic Springs

To anchor characters to their natural text layouts, we add virtual springs pulling each character back to its original coordinate:

$$F_{\text{spring}} = -k \cdot (x - x_{\text{anchor}})$$

Where $k$ is the spring stiffness constant. In JavaScript:

```javascript
const stiffness = 0.08; // Spring tension
const damping = 0.92;   // Friction drag

// Apply spring acceleration toward anchor coordinate
const fx = (anchorX - p.x) * stiffness;
const fy = (anchorY - p.y) * stiffness;

p.ax += fx;
p.ay += fy;
```

Combined with Verlet integration, this creates a beautiful, wobble-like motion that automatically stabilizes without complex matrix math.

---

## 4. Cursor Displacements (Attract & Repel)

We can displace particles based on the coordinates of the user's cursor:

```javascript
const dx = mouseX - p.x;
const dy = mouseY - p.y;
const dist = Math.sqrt(dx * dx + dy * dy);

const repelRadius = 120;
if (dist < repelRadius) {
  // Calculate repel force strength based on distance
  const force = (repelRadius - dist) / repelRadius;
  const angle = Math.atan2(dy, dx);
  
  // Push the current position directly (Verlet resolves velocity)
  p.x -= Math.cos(angle) * force * 15;
  p.y -= Math.sin(angle) * force * 15;
}
```

This is the exact technique powering `@eldrex/anomotionjs-physics`, providing interactive and elastic text typography animations.
