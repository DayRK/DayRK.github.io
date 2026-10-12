import { cookies } from 'next/headers';
import { SESSION_COOKIE, getRoleFromToken } from './auth';
import { fetchModuleVisibility } from './db';
import { isModuleVisible, type ModuleKey, type ModuleVisibility } from './modules';

/**
 * Reads the visibility flags for the public site. Fails soft: an unreadable
 * table means everything stays visible.
 */
export async function getModuleVisibility(): Promise<ModuleVisibility> {
  return fetchModuleVisibility();
}

/**
 * True only when the request carries a valid admin session cookie. This is the
 * server's own check, never anything the browser claims.
 */
export async function isAdminSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;

    if (!token) return false;

    return getRoleFromToken(token) === 'admin';
  } catch {
    return false;
  }
}

/**
 * Decides whether a page or section may render.
 *
 * A visible module is shown to everyone. A hidden module renders only for a
 * signed-in admin (so they can preview it) and is treated as missing for
 * everyone else — `notFound()` on a page, nothing at all in a section.
 */
export async function resolveModuleAccess(key: ModuleKey): Promise<{
  allowed: boolean;
  hidden: boolean;
}> {
  const visibility = await getModuleVisibility();

  if (isModuleVisible(visibility, key)) {
    return { allowed: true, hidden: false };
  }

  const admin = await isAdminSession();

  return { allowed: admin, hidden: true };
}
