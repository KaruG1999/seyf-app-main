import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export const POC_USER_COOKIE = "seyf_poc_user_id";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parsePocUserIdFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    const [name, ...rest] = part.split("=");
    if (name === POC_USER_COOKIE) {
      const value = decodeURIComponent(rest.join("=")).trim();
      if (UUID_RE.test(value)) return value;
    }
  }
  return null;
}

export function resolvePocUserIdFromRequest(req: Request): {
  userId: string;
  isNew: boolean;
} {
  const fromHeader = parsePocUserIdFromCookieHeader(req.headers.get("cookie"));
  if (fromHeader) {
    return { userId: fromHeader, isNew: false };
  }
  return { userId: randomUUID(), isNew: true };
}

export async function getOrCreatePocUserId(): Promise<{
  userId: string;
  isNew: boolean;
}> {
  const jar = await cookies();
  const raw = jar.get(POC_USER_COOKIE)?.value?.trim();
  if (raw && UUID_RE.test(raw)) {
    return { userId: raw, isNew: false };
  }
  return { userId: randomUUID(), isNew: true };
}
