export interface ExtractedContent {
    title: string;
    html: string;
    markdown: string;
    text: string;
    byline: string | null;
    excerpt: string | null;
    length: number;
}
export interface ExtractionResult {
    sourceUrl: string;
    content: ExtractedContent;
}
export declare class ExtractionError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
/**
 * Fetch the HTML at `url` and extract the main readable content.
 *
 * Throws ExtractionError for invalid URLs, fetch failures, JS-rendered pages,
 * or when no article content can be found.
 *
 * No URL, IP, or content is stored or logged.
 */
export declare function extractFromUrl(url: string): Promise<ExtractionResult>;
