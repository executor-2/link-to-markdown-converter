import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from './converter.js';

// Helper: trim trailing newline for concise assertions
const md = (html: string) => htmlToMarkdown(html).trimEnd();

describe('headings', () => {
  it('converts h1 through h6', () => {
    expect(md('<h1>Alpha</h1>')).toBe('# Alpha');
    expect(md('<h2>Beta</h2>')).toBe('## Beta');
    expect(md('<h3>Gamma</h3>')).toBe('### Gamma');
    expect(md('<h4>Delta</h4>')).toBe('#### Delta');
    expect(md('<h5>Epsilon</h5>')).toBe('##### Epsilon');
    expect(md('<h6>Zeta</h6>')).toBe('###### Zeta');
  });

  it('strips leading/trailing whitespace inside headings', () => {
    expect(md('<h1>  Trimmed  </h1>')).toBe('# Trimmed');
  });

  it('produces a blank line between adjacent headings', () => {
    expect(md('<h1>One</h1><h2>Two</h2>')).toBe('# One\n\n## Two');
  });
});

describe('paragraphs', () => {
  it('wraps content in blank lines', () => {
    expect(md('<p>Hello world</p>')).toBe('Hello world');
  });

  it('separates adjacent paragraphs with a blank line', () => {
    expect(md('<p>First</p><p>Second</p>')).toBe('First\n\nSecond');
  });

  it('ignores empty paragraphs', () => {
    expect(md('<p></p>')).toBe('');
  });
});

describe('inline formatting', () => {
  it('converts <strong> and <b> to bold', () => {
    expect(md('<strong>Bold</strong>')).toBe('**Bold**');
    expect(md('<b>Bold</b>')).toBe('**Bold**');
  });

  it('converts <em> and <i> to italic', () => {
    expect(md('<em>Italic</em>')).toBe('*Italic*');
    expect(md('<i>Italic</i>')).toBe('*Italic*');
  });

  it('converts <del> and <s> to strikethrough', () => {
    expect(md('<del>Deleted</del>')).toBe('~~Deleted~~');
    expect(md('<s>Struck</s>')).toBe('~~Struck~~');
  });

  it('handles nested inline formatting', () => {
    expect(md('<p><strong><em>Bold italic</em></strong></p>')).toBe(
      '***Bold italic***'
    );
  });

  it('handles inline formatting within a paragraph', () => {
    expect(md('<p>Hello <strong>world</strong>!</p>')).toBe(
      'Hello **world**!'
    );
  });
});

describe('inline code', () => {
  it('wraps with backticks', () => {
    expect(md('<code>const x = 1</code>')).toBe('`const x = 1`');
  });

  it('decodes HTML entities inside inline code', () => {
    expect(md('<code>a &lt; b &amp;&amp; c &gt; d</code>')).toBe(
      '`a < b && c > d`'
    );
  });
});

describe('code blocks', () => {
  it('wraps <pre><code> in fenced code block', () => {
    const html = '<pre><code>const x = 1;\nconst y = 2;\n</code></pre>';
    expect(md(html)).toBe('```\nconst x = 1;\nconst y = 2;\n```');
  });

  it('includes language hint from class attribute', () => {
    const html =
      '<pre><code class="language-javascript">console.log("hi");</code></pre>';
    expect(md(html)).toBe('```javascript\nconsole.log("hi");\n```');
  });

  it('supports lang- prefix as well as language-', () => {
    const html = '<pre><code class="lang-ts">let x: number;</code></pre>';
    expect(md(html)).toBe('```ts\nlet x: number;\n```');
  });

  it('decodes HTML entities in code blocks', () => {
    const html = '<pre><code>if (a &lt; b) { return &amp;c; }</code></pre>';
    expect(md(html)).toBe('```\nif (a < b) { return &c; }\n```');
  });

  it('handles <pre> without a nested <code>', () => {
    const html = '<pre>plain preformatted</pre>';
    expect(md(html)).toBe('```\nplain preformatted\n```');
  });
});

describe('blockquotes', () => {
  it('prefixes each line with >', () => {
    expect(md('<blockquote><p>Quoted text</p></blockquote>')).toBe(
      '> Quoted text'
    );
  });

  it('handles multi-line blockquotes', () => {
    const html = '<blockquote><p>Line one</p><p>Line two</p></blockquote>';
    const result = md(html);
    expect(result).toContain('> Line one');
    expect(result).toContain('> Line two');
  });
});

describe('unordered lists', () => {
  it('converts <ul> items with dash prefix', () => {
    const html = '<ul><li>Alpha</li><li>Beta</li><li>Gamma</li></ul>';
    expect(md(html)).toBe('- Alpha\n- Beta\n- Gamma');
  });

  it('handles nested <ul>', () => {
    const html =
      '<ul><li>Parent<ul><li>Child A</li><li>Child B</li></ul></li><li>Sibling</li></ul>';
    const result = md(html);
    expect(result).toBe('- Parent\n  - Child A\n  - Child B\n- Sibling');
  });

  it('handles deeply nested lists', () => {
    const html =
      '<ul><li>A<ul><li>B<ul><li>C</li></ul></li></ul></li></ul>';
    const result = md(html);
    expect(result).toBe('- A\n  - B\n    - C');
  });
});

describe('ordered lists', () => {
  it('converts <ol> items with numbered prefix', () => {
    const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
    expect(md(html)).toBe('1. First\n2. Second\n3. Third');
  });

  it('handles nested ordered inside unordered', () => {
    const html =
      '<ul><li>Item<ol><li>Step 1</li><li>Step 2</li></ol></li></ul>';
    const result = md(html);
    expect(result).toBe('- Item\n  1. Step 1\n  2. Step 2');
  });
});

describe('hyperlinks', () => {
  it('converts to [text](url)', () => {
    expect(md('<a href="https://example.com">Example</a>')).toBe(
      '[Example](https://example.com)'
    );
  });

  it('returns just the text when href is empty', () => {
    expect(md('<a href="">No URL</a>')).toBe('No URL');
  });

  it('returns just the href when link text is empty', () => {
    expect(md('<a href="https://example.com"></a>')).toBe(
      'https://example.com'
    );
  });

  it('handles bold inside links', () => {
    expect(
      md('<a href="https://example.com"><strong>Bold link</strong></a>')
    ).toBe('[**Bold link**](https://example.com)');
  });
});

describe('images', () => {
  it('converts to ![alt](src)', () => {
    expect(
      md('<img src="https://example.com/img.png" alt="A photo">')
    ).toBe('![A photo](https://example.com/img.png)');
  });

  it('handles missing alt attribute', () => {
    expect(md('<img src="https://example.com/img.png">')).toBe(
      '![](https://example.com/img.png)'
    );
  });

  it('returns alt text when src is missing', () => {
    expect(md('<img alt="Fallback text">')).toBe('Fallback text');
  });
});

describe('thematic break', () => {
  it('converts <hr> to ---', () => {
    expect(md('<hr>')).toBe('---');
  });
});

describe('clean output', () => {
  it('does not produce more than one blank line between blocks', () => {
    const html =
      '<h1>Title</h1><p>Para one</p><p>Para two</p>';
    const result = md(html);
    expect(result).not.toMatch(/\n{3,}/);
    expect(result).toBe('# Title\n\nPara one\n\nPara two');
  });

  it('strips trailing whitespace from every line', () => {
    const result = htmlToMarkdown('<p>Hello</p>');
    const lines = result.split('\n');
    for (const line of lines) {
      expect(line).toBe(line.trimEnd());
    }
  });

  it('always ends with exactly one newline', () => {
    expect(htmlToMarkdown('<p>Content</p>')).toMatch(/\n$/);
    expect(htmlToMarkdown('<p>Content</p>')).not.toMatch(/\n\n$/);
  });

  it('returns an empty string (plus newline) for empty input', () => {
    expect(htmlToMarkdown('')).toBe('\n');
  });

  it('ignores <script> and <style> tags', () => {
    const html =
      '<p>Visible</p><script>alert("x")</script><style>body{}</style>';
    expect(md(html)).toBe('Visible');
  });
});

describe('mixed content', () => {
  it('converts a realistic article fragment', () => {
    const html = `
      <h1>Getting Started</h1>
      <p>Install the package with <code>npm install foo</code>.</p>
      <h2>Usage</h2>
      <pre><code class="language-js">import foo from 'foo';
foo.run();</code></pre>
      <ul>
        <li>Fast</li>
        <li>Simple</li>
      </ul>
      <blockquote><p>It just works.</p></blockquote>
      <p>See <a href="https://example.com">the docs</a> for details.</p>
    `;
    const result = md(html);
    expect(result).toContain('# Getting Started');
    expect(result).toContain('`npm install foo`');
    expect(result).toContain('## Usage');
    expect(result).toContain('```js');
    expect(result).toContain("import foo from 'foo';");
    expect(result).toContain('- Fast');
    expect(result).toContain('- Simple');
    expect(result).toContain('> It just works.');
    expect(result).toContain('[the docs](https://example.com)');
    expect(result).not.toMatch(/\n{3,}/);
  });
});
