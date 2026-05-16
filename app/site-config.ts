/**
 * URL canónica del sitio para metadatos (og:image, twitter, enlaces absolutos).
 * En Vercel, si no defines NEXT_PUBLIC_SITE_URL, se usa VERCEL_URL en build.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
