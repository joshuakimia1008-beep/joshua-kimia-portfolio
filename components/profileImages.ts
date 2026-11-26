export function parseProfileImageUrls(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (url): url is string => typeof url === "string" && url.trim().length > 0,
      );
    }
  } catch {
    // Values saved before the gallery feature are plain image URLs.
  }
  return [value];
}
