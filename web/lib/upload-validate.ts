const ALLOWED_EXTENSIONS = new Set([
  "pdf", "png", "jpg", "jpeg", "gif", "webp", "md", "txt", "json",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const MIME_MAP: Record<string, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  md: ["text/markdown", "text/plain", "application/octet-stream"],
  txt: ["text/plain"],
  json: ["application/json", "text/plain"],
};

export function validateUpload(
  file: File
): { valid: true } | { valid: false; error: string } {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `File type .${ext} not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds 25MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  const allowedMimes = MIME_MAP[ext];
  if (allowedMimes && file.type && !allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `MIME type ${file.type} does not match extension .${ext}`,
    };
  }

  return { valid: true };
}
