export function asset(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.replace(/^\/+/, "");
  return `${base.endsWith("/") ? base : `${base}/`}${clean}`;
}
