# Text API Reference

The `@eldrex/anomotionjs-text` package contains utility methods for character segmentation, font state validation, and semantic DOM layouts.

---

## 1. Class: `TextParser`

Static helper utilities for character and DOM operations.

### Methods

#### `parse(text)`
Segments a raw text string into a structured array of character indexes and word scopes.
- **Parameters:**
  - `text: string` — The text string to parse.
- **Returns:** `ParsedGlyph[]` — Array containing character, global index, and word coordinate pointers.
- **Usage Example:**
  ```javascript
  import { TextParser } from '@eldrex/anomotionjs-text';

  const glyphs = TextParser.parse('HELLO WORLD');
  console.log(glyphs[0]); // { char: 'H', wordIndex: 0, charIndex: 0 }
  ```

#### `loadFont(fontFamily, url)`
Checks support and loads custom fonts into the document's font registry safely.
- **Parameters:**
  - `fontFamily: string` — The family name identifier (e.g. `'Outfit'`).
  - `url?: string` — The font URL path (e.g. from Google Fonts or local asset).
- **Returns:** `Promise<void>` — Resolves when the font is successfully loaded or fallback takes effect.

#### `injectDOMSpans(container, content)`
Clears target elements and re-injects HTML containing structured `<span>` wraps. Used by the DOM renderer to target characters individually.
- **Parameters:**
  - `container: HTMLElement` — The target wrapper element.
  - `content: string` — The text content to segment and inject.
- **Returns:** `HTMLElement[]` — Array of created character `<span>` elements.

---

## 2. Interface: `ParsedGlyph`

The structured representation of parsed letters:

- `char: string` — The character string value (e.g. `'A'`).
- `wordIndex: number` — The index of the word containing the character (0-indexed).
- `charIndex: number` — The global index of the character within the entire string (0-indexed).
- `element?: HTMLElement` — Optional reference to the representing DOM element.
