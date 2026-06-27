# Quick Start Guide

Get up and running with AnomotionJS in less than 5 minutes. This guide walks you through setting up a basic DOM-based text animation pipeline.

---

## 1. Prepare Your HTML

Create a container element in your HTML page with some initial text content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AnomotionJS Quick Start</title>
  <style>
    body {
      background: #000;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: sans-serif;
    }
    #hero {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: 0.1em;
    }
  </style>
</head>
<body>

  <!-- The target container for the animation -->
  <h1 id="hero">EXPLORE ANOMOTION</h1>

</body>
</html>
```

---

## 2. Initialize AnomotionJS

Next, initialize your animation by importing the core library and registering a renderer. We will use the DOM/CSS renderer for standard browser animation:

```javascript
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Registers 'dom' and 'canvas' automatically

// Create and start the text animation pipeline
const anim = Anomotion.create('#hero', {
  effect: 'wave',           // The animation motion type
  duration: 1.8,            // Cycle duration in seconds
  stagger: 60,              // Delay between characters in milliseconds
  easing: 'easeOutElastic', // Easing mathematical equation
  textColor: '#0070f3',     // Dynamic base text color
  loop: true                // Automatically repeat the cycle
});
```

---

## 3. Controlling the Playback

The object returned by `Anomotion.create` gives you full control over the animation lifecycle:

```javascript
// Pause the animation loop
anim.paused = true;

// Reverse the direction of timeline progression
anim.reversed = true;

// Resume the animation
anim.paused = false;

// Seek to a specific progress position (in seconds)
anim.currentTime = 0.5;

// Safely dispose of element spans, events, and performance loops
anim.destroy();
```

---

## 4. Next Steps

Now that you have your first text animation running, check out the other guides to unlock the full power of the engine:
- Learn about the underlying [Core Concepts](./core-concepts) of the splits model and tickers.
- Review all available animation effects in the [Effects Catalog](./effects-catalog).
- Integrate into modern setups with our [Framework Integration Guide](./frameworks).
