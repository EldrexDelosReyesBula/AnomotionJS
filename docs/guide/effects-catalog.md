# Effects Catalog v1.0.2

AnomotionJS v1.0.2 ("Kinetic Glyph") focuses on mathematical 2D animations, interactive SVG paths, microphone audio analyzers, custom formula scripting, and organic/glitch motion.

---

## 1. SVG Text Path Animations & Alignment

These options align characters to flow and trace along arbitrary 2D SVG path strings.

| Option / Preset | Description | Parameters |
|-----------------|-------------|------------|
| `path` | Core option accepting a standard SVG path string (e.g. `d="M 10 120 Q 150 40, 300 120 T 590 120"`). Glyphs space and flow along it. | `path` (string), `showPathOverlay` (boolean) |
| Predefined Paths | Wave, Perfect Circle, and Zigzag templates built directly into the playground. | Selectable via `#svgPathSelect` dropdown. |

---

## 2. Voice-Driven Audio Reactivity (Web Audio API)

Real-time animation responding to user microphone amplitude levels, processed entirely in the browser client-side.

| Effect Name | Description | API Control |
|-------------|-------------|-------------|
| `bounceVoice` | Characters bounce, squash, and stretch dynamically on microphone volume peaks. | `Anomotion.voice.request()` triggers permission prompts; `Anomotion.voice.getLevel()` yields peak values. |

---

## 3. Custom Effect Compiler & Scripting Nodes

Type mathematical equations directly at runtime to register and run custom text animations on the fly.

| Feature | Description | Example Usage |
|---------|-------------|---------------|
| `customEquation` | Map progress and index to custom Y-offsets. | `Anomotion.create('#el', { customEquation: "(t, i) => Math.sin(t * Math.PI * 4 + i * 0.5) * -30" })` |
| `Anomotion.effect.register` | Programmatically register custom style deltas for complex multi-property shifts. | `Anomotion.effect.register('custom', () => (t, i) => ({ y: Math.cos(t) * 10, scaleX: t }))` |

---

## 4. Organic & Nature-Inspired 2D Presets

Smooth, lifelike simulations modeled directly via trigonometry.

| Preset | Description | Parameters |
|--------|-------------|------------|
| `breathe` | Glyphs expand and contract gently, simulating breathing lungs. | `frequency`, `amplitude` |
| `neonSign` | Text glows like a neon tube, with warm flickers and occasional brownouts. | `glowBlur`, `glowColor` |
| `waterRipple` | Glyphs oscillate out-of-phase like a drop on a pond surface. | `frequency`, `amplitude` |
| `leafFall` | Characters float downward, swaying side-to-side and fading out like autumn foliage. | `duration`, `stagger` |

---

## 5. Glitch & Digital Art Presets

Retro CRT monitor scans, intentional radio signal noise, and data corruption.

| Preset | Description | Parameters |
|--------|-------------|------------|
| `scanLine` | CRT scan line simulation with micro-flicker brightness updates. | `frequency` |
| `dataCorrupt` | Text characters temporarily transform into hex dump symbols or wrong ASCII codes before resolving. | `seed`, `glitchIntensity` |
| `vhsRewind` | Horizontal VHS tape head tracking line offsets and color channels shift. | `shiftAmount`, `colorChannels` |
| `glitch` (v2) | Anti-flicker slice translation offsets. | `sliceCount`, `shiftAmount` |

---

## 6. Narrative, Storytelling & Temporal Presets

Sequence-aware or time-aware text animations.

| Preset | Description | Parameters |
|--------|-------------|------------|
| `whisper` | Low-opacity characters fade in from staggered, random horizontal offsets. | `seed`, `stagger` |
| `shout` | Glyphs slam in with overshoot, rotation sways, and temporary scale bursts. | `overshoot`, `duration` |
| `typewriterDelete` | Types words forward, pauses, deletes/backspaces half the text, and retypes. | `typingSpeed`, `loopDelay` |
| `realTimeClock` | Characters dynamically animate and morph to match the system clock time (HH:MM:SS). | `duration` |
| `relativeTime` | Animates symbols and alerts based on elapsed page view duration. | `duration` |

---

## 7. Directional, Physics, & Particle Effects

| Preset | Description | Parameters |
|--------|-------------|------------|
| `slideUp` / `slideDown` | Staggered vertical entrance with spring overshoot. | `distance`, `stagger` |
| `cascade` | Glyphs fall from top boundaries with elastic floor bounces. | `gravity`, `bounceDamping` |
| `vortex` | Swirling circular tornado entrance fading to clean linear layout. | `amplitude`, `frequency` |
| `particleAssemble` | Floating canvas particles gather together to form text. | `particleCount`, `settleSpeed` |
| `dissolve` | Characters disintegrate into sand-like particles blowing away. | `windForce`, `particleSize` |
| `melt` | Characters melt downwards, creating drip structures. | `meltAmount`, `dripLength` |

---

## 8. Easing Catalogue Reference

All built-in ease strings supported by `Anomotion.create()`:
- **Penner Eases:** `linear`, `easeOutExpo`, `easeOutElastic`, `easeOutBounce`, `easeOutBack`, `easeInOutQuad`, `easeInSine`, `easeOutSine`, `easeInOutSine`
- **RK4 Springs:** `spring({ mass: 1, stiffness: 170, damping: 26 })`
- **Steps Quantizer:** `steps(8, end)`
