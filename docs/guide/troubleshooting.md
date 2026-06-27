# Troubleshooting Guide

Common issues encountered when installing or configuring AnomotionJS and how to resolve them.

---

## 1. Error: "Renderer 'x' is not registered"

This error occurs when you specify a renderer type (like `dom`, `canvas`, or `three`) in your options, but forgot to import the corresponding package that registers it.

- **Solution:** Import the renderer module at the entry point of your application:
  ```javascript
  import Anomotion from '@eldrex/anomotionjs-core';
  
  // To use 'dom' or 'canvas' renderers:
  import '@eldrex/anomotionjs-renderer-2d';

  // To use 'three' (WebGL) renderer:
  import '@eldrex/anomotionjs-renderer-3d';
  ```

---

## 2. Text layout wrapping or breaking

When using the `dom` renderer, words and characters are wrapped inside inline-block `<span>` elements. In some CSS layouts, this can cause unwanted wrapping.

- **Solution:** Add CSS overrides to the container or glyph elements to prevent word breaks:
  ```css
  /* Prevent characters from breaking across lines */
  .anomotion-word {
    display: inline-block;
    white-space: nowrap;
  }
  .anomotion-glyph {
    display: inline-block;
    position: relative;
  }
  ```

---

## 3. Canvas element sizes are blur or distorted

When using the `canvas` renderer, the canvas resolution might appear pixelated or misaligned with parent container bounds.

- **Solution:** Make sure your container element has explicit dimensions (width and height set in CSS), as the canvas scales dynamically based on bounding rect metrics:
  ```css
  #my-container {
    width: 600px;
    height: 200px;
    position: relative; /* Essential for relative canvas layouts */
  }
  ```

---

## 4. Playback loop lags or drops frames

This is typically caused by creating multiple, overlapping animation instances on the same container element without disposing of previous instances.

- **Solution:** `Anomotion.create()` automatically disposes of any existing instance attached to the target selector. However, if you initialize animations manually via `new TextAnimation()`, you must explicitly call `destroy()` before initializing a new one:
  ```javascript
  const anim = Anomotion.create('#hero', { effect: 'wave' });

  // Clean up safely when container unmounts (e.g. React/Vue hooks)
  anim.destroy();
  ```
