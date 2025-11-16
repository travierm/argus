import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme
} from 'shiki';


class ShikiService {
  private static instance: ShikiService | null = null;
  private highlighter: Highlighter | null = null;
  private initPromise: Promise<void> | null = null;
  private refCount = 0;

  private constructor() {}


  static getInstance(): ShikiService {
    if (!ShikiService.instance) {
      ShikiService.instance = new ShikiService();
    }
    return ShikiService.instance;
  }

  async init(): Promise<void> {
    this.refCount++;

    if (this.highlighter) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.highlighter = await createHighlighter({
          themes: ['github-dark'],
          langs: [
            'typescript',
            'javascript',
            'json',
            'php',
          ]
        });
      } catch (error) {
        console.error('Failed to initialize Shiki:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }


  highlight(code: string, lang: string = 'text'): string {
    if (!this.highlighter) {
      return this.escapeHtml(code);
    }

    try {
      const normalizedLang = lang;
      
      const loadedLanguages = this.highlighter.getLoadedLanguages();
      if (!loadedLanguages.includes(normalizedLang as BundledLanguage)) {
          this.highlighter.loadLanguage(normalizedLang as BundledLanguage);
      }

      const result = this.highlighter.codeToTokens(code, {
        lang: normalizedLang as BundledLanguage,
        theme: 'github-dark'
      });

      if (!result.tokens[0]) {
        return this.escapeHtml(code);
      }

      return result.tokens[0]
        .map(token => {
          if (token.color) {
            return `<span style="color:${token.color}">${this.escapeHtml(token.content)}</span>`;
          }
          return this.escapeHtml(token.content);
        })
        .join('');
    } catch (error) {
      console.error('Error highlighting code:', error);
      return this.escapeHtml(code);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text; // prevent XSS
    return div.innerHTML;
  }

  async dispose(): Promise<void> {
    this.refCount = Math.max(0, this.refCount - 1);

    if (this.refCount === 0 && this.highlighter) {
      this.highlighter.dispose();
      this.highlighter = null;
      this.initPromise = null;
      ShikiService.instance = null;
    }
  }

  isReady(): boolean {
    return this.highlighter !== null;
  }
}

export default ShikiService;

