/**
 * Join backend base URL with a catalog path, or pass through absolute http(s) URLs.
 */
export function resolveMediaUrl(backendBaseUrl: string, audioUrl: string): string {
  const trimmed = backendBaseUrl.replace(/\/$/, '');
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
    return audioUrl;
  }
  if (audioUrl.startsWith('/')) {
    return `${trimmed}${audioUrl}`;
  }
  return `${trimmed}/${audioUrl}`;
}
