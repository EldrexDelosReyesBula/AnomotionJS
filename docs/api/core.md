# Core API Reference

The `@eldrex/anomotionjs-core` package manages animation ticker loops, maintains glyph coordinates, and handles update schedules.

---

## 1. Object: `Anomotion`

The primary gateway for configuring and spawning animations.

### Methods

#### `create(selector, options)`
Initializes an animation pipeline on a target element.
- **Parameters:**
  - `selector: string | HTMLElement` — A CSS selector or a direct DOM element.
  - `options: AnimationOptions` — Configuration options.
- **Returns:** `TextAnimation | null` — The active animation runner instance, or `null` if setup failed.

#### `registerRenderer(name, rendererClass)`
Registers a custom drawing adapter.
- **Parameters:**
  - `name: string` — The identifier key (e.g. `'svg'`).
  - `rendererClass: typeof Renderer` — The renderer class constructor.

#### `use(plugin)`
Installs an extension plugin into the engine.
- **Parameters:**
  - `plugin: Plugin` — An object conforming to the `Plugin` interface.
- **Returns:** `typeof Anomotion` — The static `Anomotion` object (supports chainable definitions).

---

## 2. Class: `TextAnimation`

The active runner instantiated for each animated element.

### Properties

- `renderer: Renderer` — The linked renderer instance.
- `options: Required<AnimationOptions>` — Full resolved options configuration.
- `states: GlyphState[]` — The live array of coordinate states for each letter.
- `paused: boolean` — Toggles tick update calls (Default: `false`).
- `reversed: boolean` — Toggles forward/backward timeline progression direction (Default: `false`).
- `currentTime: number` — The current playhead location in seconds.

### Methods

#### `update(time)`
Ticks the timeline math and triggers the drawing callback.
- **Parameters:**
  - `time: number` — High-resolution timestamp from `requestAnimationFrame`.
- **Returns:** `boolean` — Returns `true` if the animation duration has been exceeded and loop is disabled.

#### `destroy()`
Cleans up event listeners, removes DOM wrappers, and unregisters the instance from the global animation loop.

---

## 3. Interface: `AnimationOptions`

Parameters passed to `Anomotion.create()`:

- `effect?: string` — Presets (e.g. `'wave'`, `'glitch'`, `'reveal'`, `'explode'`, `'float'`, `'vortex'`).
- `duration?: number` — Animation cycle runtime in seconds (Default: `1.8`).
- `stagger?: number` — Offset delay per character in milliseconds (Default: `50`).
- `easing?: EasingType` — Easing formula (`'linear'`, `'easeOutElastic'`, `'easeInOutQuad'`, `'easeOutBounce'`, `'easeOutBack'`).
- `loop?: boolean` — Repeat state (Default: `true`).
- `physics?: boolean` — Enables the Verlet integration physics plugin (Default: `false`).
- `text?: string` — Text content override.
- `renderer?: 'dom' | 'canvas' | 'three'` — Drawing surface type (Default: `'dom'`).
- `textColor?: string` — Base text color override (hex/rgb).
- `glitchColor?: string` — Accent color used during glitch spikes.
- `customEquation?: string | ((t: number, i: number) => number)` — Custom parametric displacement formula.
- `mouseInteraction?: boolean` — Enables hover cursor displacements (Default: `true`).
- `frequency?: number` — Wave speed factor (Default: `2.0`).
- `amplitude?: number` — Displacement range limit in pixels (Default: `30`).
