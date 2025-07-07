/**
 * Validates if a URL is safe by checking if it uses http or https protocols
 * @param url - The URL to validate
 * @returns true if the URL is safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
} 