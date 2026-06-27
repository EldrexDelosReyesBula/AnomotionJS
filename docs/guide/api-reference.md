# API Reference

Explore the full API design of AnomotionJS, detailing modules, timeline variables, and render interfaces.

---

## 1. Core Namespace (`Anomotion`)

### `Anomotion.create(selector, options)`
Main entry point to parse text, initialize rendering pipelines, and register timeline animation loops.

- **`selector`** (`string | HTMLElement`): The query selector or DOM element container to parse and animate.
- **`options`** (`AnimationOptions`): Animation parameter options.

#### `AnimationOptions` properties:
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `effect` | `string` | `'wave'` | Preset motion pipeline. Options: `'wave'`, `'glitch'`, `'explode'`, `'reveal'`, `'float'`, `'vortex'`. |
| `duration` | `number` | `1.8` | The timeline loop duration in seconds. |
| `stagger` | `number` | `50` | Milliseconds trigger offset applied sequentially between characters. |
| `easing` | `string` | `'easeOutElastic'` | Interpolation curve name. Options: `'linear'`, `'easeOutElastic'`, `'easeInOutQuad'`, `'easeOutBounce'`, `'easeOutBack'`. |
| `loop` | `boolean` | `true` | Restarts the timeline loop automatically upon completion. |
| `physics` | `boolean` | `false` | Enables Verlet integration physical simulation forces. |
| `renderer` | `string` | `'dom'` | Target drawing adapter. Options: `'dom'`, `'canvas'`, `'three'`, `'webgpu'`. |
| `text` | `string` | `''` | Overrides the original HTML text content during initialization. |

---

### `Anomotion.use(plugin)`
Registers a middleware plugin into the animation lifecycle.

```javascript
import { SVGPathPlugin } from '@eldrex/anomotionjs-plugins';
Anomotion.use(SVGPathPlugin);
```

---

### `Anomotion.registerRenderer(name, rendererClass)`
Registers custom renderer adapters backing the engine.

```javascript
Anomotion.registerRenderer('custom-renderer', MyRendererClass);
```

---

## 2. TextAnimation Timeline Instance

When calling `Anomotion.create()`, it returns a `TextAnimation` timeline controller instance.

### Properties:
- **`paused`** (`boolean`): Toggle execution loop state.
- **`reversed`** (`boolean`): If true, calculations run in reverse direction.
- **`currentTime`** (`number`): Active playhead location in seconds. Can be read or directly modified (seeking).
- **`states`** (`GlyphState[]`): Array containing transform properties calculated for each glyph.
- **`physicsInstance`** (`PhysicsModule | null`): Set if `physics` option is enabled.

### Methods:
- **`destroy()`**: Unbinds tickers, stops loop execution, and disposes elements from DOM memory.

---

## 3. Physics Simulation (`PhysicsModule`)

Available when setting `physics: true` on creation.

### Parameters:
- **`forceType`** (`'spring' | 'gravity' | 'attract' | 'repel'`): Active force category.
  - `'spring'`: Gravity pulling glyphs back onto their baseline slots.
  - `'gravity'`: Pulls glyphs downwards towards a bounce ceiling floor.
  - `'attract'`: Magnetic attraction force vector tracking the cursor.
  - `'repel'`: Repulsion wind force blowing characters away from the mouse.
- **`stiffness`** (`number`): Spring returning strength factor.
- **`damping`** (`number`): Drag/friction coefficient. Higher value limits oscillation speed.
- **`mousePos`** (`{ x: number | null, y: number | null }`): Reference coordinate bindings.

---

## 4. Custom Renderer Development

All renderers must implement the basic TypeScript contract:

```typescript
export interface Renderer {
  glyphs: any[];
  mount(text: string): void;
  render(states: GlyphState[]): number; // Returns calculation execution duration in ms
  dispose(): void;
  resize?(): void;
}
```
`mount(text)` initializes elements, and `render(states)` runs on every Frame tick to draw changes.
