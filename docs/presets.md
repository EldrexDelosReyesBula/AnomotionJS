# Easing & Presets Gallery

AnomotionJS v1.0.2 features an interactive playground studio where you can browse, preview, configure, and download configurations for all built-in text presets.

## 1. Built-in Easing Functions

You can specify any standard Penner curve, customize cubic-bezier values, steps, or config physics-based spring models.

### Penner Curves
- **Linear:** `linear`
- **Expo Out:** `easeOutExpo`
- **Elastic Out:** `easeOutElastic`
- **Bounce Out:** `easeOutBounce`
- **Back Out:** `easeOutBack`

### Physics Spring
- **Spring Solver:** `spring({ mass: 1, stiffness: 170, damping: 26 })`

### Custom Easing Registration
You can register your custom easing curves at runtime:
```javascript
Anomotion.easing.register('myCustomEase', (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
});
```

---

## 2. Interactive Preset Browser

Browse our key pre-built 2D motion pathways and visual styles:

### Wave Effect
<Playground preset="wave" height="200px" showCode="true" />

### Glitch v2 (Zero-Flicker)
<Playground preset="glitch" height="200px" showCode="true" />

### Reveal (Staggered Slide-up)
<Playground preset="reveal" height="200px" showCode="true" />

### Explode (Radial Dispersion)
<Playground preset="explode" height="200px" showCode="true" />

### Breathe (Organic Pulsation)
<Playground preset="breathe" height="200px" showCode="true" />

### Water Ripple
<Playground preset="waterRipple" height="200px" showCode="true" />
