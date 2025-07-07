/**
 * Validates if a URL is safe by checking if it uses http or https protocols
 * @param url - The URL to validate
 * @returns true if the URL is safe, false otherwise
 */
export function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Whitelist-Ansatz: Nur http und https sind erlaubt
    const safeProtocols = ['http:', 'https:'];
    // Blacklist gefährlicher Protokolle
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.includes(urlObj.protocol)) {
      return false;
    }
    return safeProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
} 