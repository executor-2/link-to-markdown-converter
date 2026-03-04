/**
 * Convert an HTML string into clean, well-formatted Markdown.
 *
 * Handles headings (h1–h6), paragraphs, bold, italic, inline code, fenced
 * code blocks (with language hints), blockquotes, ordered/unordered lists
 * (including nesting), hyperlinks, and images.
 *
 * @param html - Raw HTML string (fragment or full document).
 * @returns Markdown string with a single trailing newline.
 */
export declare function htmlToMarkdown(html: string): string;
