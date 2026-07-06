import "server-only";

// Strip any trailing slash(es) so callers can safely do `${API_BASE_URL}/path`
// without risking a double slash (which Laravel's router treats as a 404).
export const API_BASE_URL = (process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8123/api/v1").replace(
  /\/+$/,
  "",
);
