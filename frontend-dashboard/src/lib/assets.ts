export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Resolves static asset paths taking into account Next.js basePath for GitHub Pages deployment.
 */
export function resolveAssetPath(path?: string | null): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (BASE_PATH && cleanPath.startsWith(BASE_PATH)) {
    return cleanPath;
  }
  return `${BASE_PATH}${cleanPath}`;
}
