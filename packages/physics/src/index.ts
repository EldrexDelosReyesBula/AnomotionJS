import { Plugin, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';

export interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  ax: number;
  ay: number;
  targetX: number;
  targetY: number;
  mass: number;
}

export class PhysicsModule {
  public particles: Particle[];
  public stiffness = 0.08;
  public damping = 0.92;
  public forceType: 'spring' | 'gravity' | 'attract' | 'repel' = 'spring';
  public mousePos: { x: number | null; y: number | null } = { x: null, y: null };

  constructor(glyphsCount: number) {
    this.particles = Array.from({ length: glyphsCount }, () => ({
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      ax: 0,
      ay: 0,
      targetX: 0,
      targetY: 0,
      mass: 1.0
    }));
  }

  update(states: GlyphState[], elapsed: number): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const state = states[i];
      if (!state) continue;

      p.targetX = state.originalX;
      p.targetY = state.originalY;

      // Reset forces
      p.ax = 0;
      p.ay = 0;

      if (this.forceType === 'spring') {
        const fx = (p.targetX - p.x) * this.stiffness;
        const fy = (p.targetY - p.y) * this.stiffness;
        p.ax += fx;
        p.ay += fy;
      } else if (this.forceType === 'gravity') {
        p.ay += this.stiffness * 5;
        // Simple floor constraint
        if (p.y > 100) {
          p.y = 100;
          const vy = (p.y - p.py) * 0.6;
          p.py = p.y + vy;
        }
      }

      if (this.mousePos.x !== null && this.mousePos.y !== null) {
        const dx = this.mousePos.x - p.x;
        const dy = this.mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (this.forceType === 'attract' && dist < 300) {
          const strength = (300 - dist) * 0.005;
          p.ax += (dx / dist) * strength;
          p.ay += (dy / dist) * strength;
        } else if (this.forceType === 'repel' && dist < 120) {
          const strength = (120 - dist) * 0.2;
          p.ax -= (dx / dist) * strength;
          p.ay -= (dy / dist) * strength;
        }
      }

      // Verlet equations
      const vx = (p.x - p.px) * this.damping;
      const vy = (p.y - p.py) * this.damping;

      p.px = p.x;
      p.py = p.y;

      p.x += vx + p.ax;
      p.y += vy + p.ay;

      state.x = p.x;
      state.y = p.y;
    }
  }
}

// Register as Plugin
export const PhysicsPlugin: Plugin = {
  name: 'physics',
  install(core: any) {
    // Inject physics module registration hook
    const originalCreate = core.create.bind(core);
    core.create = (selector: any, options: any) => {
      const anim = originalCreate(selector, options);
      if (anim && options?.physics) {
        anim.physicsInstance = new PhysicsModule(anim.renderer.glyphs.length);
      }
      return anim;
    };
  }
};

// Auto install
Anomotion.use(PhysicsPlugin);
