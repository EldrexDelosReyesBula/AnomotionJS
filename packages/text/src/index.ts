export interface ParsedGlyph {
  char: string;
  wordIndex: number;
  charIndex: number;
  element?: HTMLElement;
}

export class TextParser {
  /**
   * Split string or HTML text into clean semantic word/character maps.
   */
  static parse(text: string): ParsedGlyph[] {
    const glyphs: ParsedGlyph[] = [];
    const words = text.split(/\s+/);
    
    let charGlobalIdx = 0;
    words.forEach((word, wordIdx) => {
      const chars = Array.from(word);
      chars.forEach((char) => {
        glyphs.push({
          char,
          wordIndex: wordIdx,
          charIndex: charGlobalIdx++
        });
      });
    });

    return glyphs;
  }

  /**
   * Safe HTML loader utility that handles font loading state checks.
   */
  static loadFont(fontFamily: string, url?: string): Promise<void> {
    if (url && 'fonts' in document) {
      const fontFace = new FontFace(fontFamily, `url(${url})`);
      return fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
      });
    }
    // Fallback if fonts loading API is not fully supported or no custom URL is provided
    return Promise.resolve();
  }

  /**
   * Wraps target elements with spans representing parsed words and glyphs.
   */
  static injectDOMSpans(container: HTMLElement, content: string): HTMLElement[] {
    container.innerHTML = '';
    const spanElements: HTMLElement[] = [];
    const words = content.split(' ');

    words.forEach((wordText, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.className = 'anomotion-word';

      const chars = Array.from(wordText);
      chars.forEach((charText) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = charText;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        charSpan.className = 'anomotion-glyph';
        wordSpan.appendChild(charSpan);
        spanElements.push(charSpan);
      });

      container.appendChild(wordSpan);

      if (wordIdx < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.innerHTML = '&nbsp;';
        spaceSpan.style.display = 'inline-block';
        container.appendChild(spaceSpan);
      }
    });

    return spanElements;
  }
}
