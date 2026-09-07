export function formatFileUrl(filePath?: string | null): string {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  let clean = filePath.replace(/^\/+/, "");
  if (clean.startsWith("public/")) {
    clean = clean.replace(/^public\//, "");
  }
  if (clean.startsWith("candidates/")) {
    clean = `uploads/${clean}`;
  }
  return `/${clean}`;
}
