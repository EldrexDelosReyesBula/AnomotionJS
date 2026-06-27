# Plugins API Reference

The `@eldrex/anomotionjs-plugins` package bridges the core engine with third-party libraries and provides advanced path animation utilities.

---

## 1. Object: `GsapPlugin`

Adapts external GSAP timelines, allowing GSAP to orchestrate and control character offsets directly.

- **Description:** Hooks into Anomotion instances and maps spans to GSAP timelines automatically when `window.gsap` is available on the window scope.
- **Install / Register:**
  ```javascript
  import Anomotion from '@eldrex/anomotionjs-core';
  import { GsapPlugin } from '@eldrex/anomotionjs-plugins';

  Anomotion.use(GsapPlugin);
  ```

---

## 2. Object: `SVGPathPlugin`

Animates characters along custom SVG paths.

- **Description:** Extends the global `Anomotion` object with the `animateOnPath` method.
- **Install / Register:**
  ```javascript
  import Anomotion from '@eldrex/anomotionjs-core';
  import { SVGPathPlugin } from '@eldrex/anomotionjs-plugins';

  Anomotion.use(SVGPathPlugin);
  ```

### Extended Methods

#### `Anomotion.animateOnPath(selector, pathSelector)`
Animates target text characters along the layout of an SVG `<path>` shape.
- **Parameters:**
  - `selector: string` — Selector for the text container.
  - `pathSelector: string` — Selector targeting the SVG `<path>` element.
- **Returns:** `TextAnimation` — The active animation instance.
- **Usage Example:**
  ```javascript
  // Animates characters dynamically along a curve
  Anomotion.animateOnPath('#text', '#my-curve-path');
  ```
