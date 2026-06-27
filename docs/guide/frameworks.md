# Framework Integration

AnomotionJS can easily be integrated into any modern web framework. Since AnomotionJS directly manipulates DOM properties, WebGL, or WebGPU contexts, the key to successful integration is **initializing the animation on mount** and **cleaning it up on unmount** to prevent memory leaks and duplicate instances.

---

## 1. React

Use `useEffect` and `useRef` to target the DOM container and manage lifecycle:

```tsx
import React, { useEffect, useRef } from 'react';
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d'; // Registers DOM & Canvas 2D renderers

interface AnimatedTextProps {
  text: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: any = null;

    if (containerRef.current) {
      animation = Anomotion.create(containerRef.current, {
        text,
        effect: 'wave',
        duration: 1.8,
        stagger: 50,
        easing: 'easeOutElastic',
        renderer: 'dom'
      });
    }

    // Cleanup on unmount to prevent overlap and memory leaks
    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, [text]);

  return <div ref={containerRef}>{text}</div>;
};
```

---

## 2. Vue 3

Use `ref` and lifecycle hooks `onMounted` / `onBeforeUnmount` inside `<script setup>`:

```vue
<template>
  <div ref="container">{{ text }}</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Anomotion from '@eldrex/anomotionjs-core';
import '@eldrex/anomotionjs-renderer-2d';

const props = defineProps({
  text: {
    type: String,
    required: true
  }
});

const container = ref(null);
let animation = null;

const init = () => {
  if (animation) animation.destroy();
  if (container.value) {
    animation = Anomotion.create(container.value, {
      text: props.text,
      effect: 'wave',
      duration: 1.8,
      stagger: 50,
      easing: 'easeOutElastic',
      renderer: 'dom'
    });
  }
};

onMounted(() => {
  init();
});

watch(() => props.text, () => {
  init();
});

onBeforeUnmount(() => {
  if (animation) {
    animation.destroy();
  }
});
</script>
```

---

## 3. Svelte 5

Use Svelte's `onMount` and `$effect` (or returning a cleanup function in effects):

```html
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Anomotion from '@eldrex/anomotionjs-core';
  import '@eldrex/anomotionjs-renderer-2d';

  let { text } = $props();
  let container: HTMLDivElement;
  let animation: any;

  $effect(() => {
    if (animation) animation.destroy();
    if (container) {
      animation = Anomotion.create(container, {
        text,
        effect: 'wave',
        duration: 1.8,
        stagger: 50,
        easing: 'easeOutElastic',
        renderer: 'dom'
      });
    }
  });

  onDestroy(() => {
    if (animation) {
      animation.destroy();
    }
  });
</script>

<div bind:this={container}>{text}</div>
```

---

## 4. Tips & Best Practices

### Avoiding Layout Thrashing
When using the DOM/CSS renderer, AnomotionJS updates style transforms in a `requestAnimationFrame` loop. To keep FPS high:
- Avoid styling your text with complex CSS filters that recalculate layout.
- If using mouse interaction or spring physics, keep the number of glyphs reasonable (under 100 characters per container).
- Use `canvas` or `three` (WebGL) renderers for longer strings or high-performance animations.

### Custom Math Equations
You can supply your own custom math equations directly as a string or JavaScript function to the `customEquation` property:

```javascript
Anomotion.create(element, {
  effect: 'custom',
  customEquation: (t, i) => Math.sin(t * Math.PI * 2 + i * 0.5) * 20
});
```

### Canvas and WebGL Resizing
If the container size changes dynamically (e.g. browser resize), tell Anomotion to recalculate bounds:
```javascript
const animation = Anomotion.create(element, { renderer: 'canvas' });

window.addEventListener('resize', () => {
  if (animation && animation.renderer.resize) {
    animation.renderer.resize();
  }
});
```
