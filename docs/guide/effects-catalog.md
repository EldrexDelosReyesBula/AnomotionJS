# Effects Catalog

AnomotionJS comes packed with highly optimized, mathematical text animation effects. You can trigger these presets directly by passing the name in the `effect` configuration property.

---

## 1. Presets Directory

Here is the complete list of built-in motion effects and their customization properties:

### `wave`
Creates a continuous, fluid wave motion.
- **Description:** Characters move up and down in a sine-wave trajectory while stretching and squashing.
- **Customization Options:**
  - `frequency`: Number of cycles (Default: `2.0`)
  - `amplitude`: Maximum vertical offset in pixels (Default: `30`)
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'wave', frequency: 3.0, amplitude: 45 });
  ```

### `glitch`
Simulates a digitized signal degradation.
- **Description:** Instantly shifts horizontal offsets and alters character scale and opacity at random intervals.
- **Customization Options:**
  - `glitchColor`: The highlight hex color applied to corrupted characters (Default: `#ff003c`)
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'glitch', glitchColor: '#00ffff' });
  ```

### `reveal`
An elegant fade-in and slide-up transition.
- **Description:** Staggered characters slide up from an offset of 50px while fading in from an opacity of 0 to 1.
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'reveal', duration: 1.2, stagger: 80 });
  ```

### `explode`
A dispersion burst effect.
- **Description:** Characters burst outward in multiple directions from a central anchor point, shrinking and fading.
- **Customization Options:**
  - `amplitude`: Explode range multiplier (Default: `30`)
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'explode', amplitude: 40 });
  ```

### `float`
A gentle, organic drifting motion.
- **Description:** Characters float up and down in an offset sine wave while rotating slightly from side to side.
- **Customization Options:**
  - `frequency`: Drifting speed (Default: `2.0`)
  - `amplitude`: Drifting range in pixels (Default: `30`)
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'float', frequency: 1.5, amplitude: 20 });
  ```

### `vortex`
Swirls characters in a vortex-like spiral.
- **Description:** Characters rotate 360 degrees while spiraling outward from a central point.
- **Customization Options:**
  - `amplitude`: Swirl radius multiplier (Default: `30`)
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'vortex', amplitude: 50, duration: 2.5 });
  ```

### `distortion`
Simulates mechanical noise or vibration.
- **Description:** Rapid, staggered vibrational movements along X and Y axes combined with sudden rotations.
- **Usage Example:**
  ```javascript
  Anomotion.create('#target', { effect: 'distortion', frequency: 4.0 });
  ```

---

## 2. Using Custom Equations

If none of the presets fit your requirements, you can write custom parametric equations directly. Pass a mathematical formula string or a JavaScript function to `customEquation`:

### String Equation
```javascript
Anomotion.create('#target', {
  customEquation: 'Math.sin(t * Math.PI) * -50' // Math formula string resolved at runtime
});
```

### Function Equation
You can pass a callback function to get full control, receiving the progress timeline factor ($t$ from 0 to 1) and the character global index ($i$):
```javascript
Anomotion.create('#target', {
  customEquation: (t, i) => {
    // Generate custom bounce offsets dynamically
    return Math.cos(t * Math.PI + i * 0.25) * -40;
  }
});
```
