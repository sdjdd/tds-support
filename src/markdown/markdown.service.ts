import { Injectable } from '@nestjs/common';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import hljs from 'highlight.js';

const DOMPurify = createDOMPurify(new JSDOM('').window as any);

@Injectable()
export class MarkdownService {
  render(src: string): string {
    const html = marked(src, {
      breaks: true,
      gfm: true,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, code).value;
          } catch {}
        }
        try {
          return hljs.highlightAuto(code).value;
        } catch {
          return '';
        }
      },
    });
    return DOMPurify.sanitize(html);
  }
}
