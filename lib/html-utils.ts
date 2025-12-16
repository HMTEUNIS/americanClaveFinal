/**
 * Utility functions for extracting and cleaning text from HTML
 */

/**
 * Extracts plain text from HTML, preserving paragraph breaks
 * Converts <br> tags to newlines and removes all HTML tags
 */
export function extractTextFromHTML(html: string): string {
  if (!html) return '';

  // Create a temporary DOM element to parse HTML
  // For server-side, we'll use a simple regex-based approach
  // For more complex cases, you might want to use a library like 'jsdom' or 'cheerio'
  
  let text = html;
  
  // Replace <br> and <br/> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Replace </p> and </div> tags with double newlines (paragraph breaks)
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n\n');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Clean up whitespace
  // Replace multiple spaces with single space
  text = text.replace(/[ \t]+/g, ' ');
  
  // Replace multiple newlines (3+) with double newline
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim each line and remove empty lines at start/end
  const lines = text.split('\n').map(line => line.trim());
  
  // Remove leading and trailing empty lines
  while (lines.length > 0 && lines[0] === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  
  return lines.join('\n').trim();
}

/**
 * Extracts text from the specific HTML structure shown in the example
 * Looks for content within <p class="pullquote"> tags
 */
export function extractBioFromHTML(html: string): string {
  if (!html) return '';

  // Try to extract content from <p class="pullquote"> first
  const pullquoteMatch = html.match(/<p[^>]*class=["']pullquote["'][^>]*>(.*?)<\/p>/is);
  if (pullquoteMatch) {
    return extractTextFromHTML(pullquoteMatch[1]);
  }
  
  // If no pullquote found, extract from any <p> tag
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/is);
  if (pMatch) {
    return extractTextFromHTML(pMatch[1]);
  }
  
  // Fallback: extract from entire HTML
  return extractTextFromHTML(html);
}

