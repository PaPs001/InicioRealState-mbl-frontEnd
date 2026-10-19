const GOOGLE_AUTH_ERRORS = [
  "unauthorized_client",
  "invalid_client",
  "invalid_grant",
  "access_denied",
  "insufficient authentication scopes",
];

export function getGoogleCalendarAuthError(error: unknown): string | null {
  if (typeof error === "string") {
    const message = error.toLowerCase();
    return GOOGLE_AUTH_ERRORS.find((code) => message.includes(code)) ?? null;
  }
  if (!error || typeof error !== "object") return null;
  const value = error as Record<string, unknown>;
  for (const key of ["error", "message", "details", "error_description"]) {
    const code = getGoogleCalendarAuthError(value[key]);
    if (code) return code;
  }
  return null;
}
