/**
 * Redis-backed Etherfuse onboarding session store.
 *
 * Clave: seyf:onboarding:{walletPublicKey}
 * Valor: { customerId, bankAccountId, updatedAt }
 *
 * Ventajas vs cookie httpOnly:
 *  - Funciona entre dispositivos / browsers
 *  - Persiste aunque el usuario borre cookies
 *  - Fuente de verdad única por wallet
 *  - Elimina errores de sesión stale al cambiar org/API key
 */

import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const KEY_PREFIX = 'seyf:onboarding'
const TTL_SEC = 60 * 60 * 24 * 365 // 1 año

export type StoredOnboardingSession = {
  customerId: string
  bankAccountId: string
  walletPublicKey: string
  updatedAt: string
}

function redisKey(walletPublicKey: string): string {
  return `${KEY_PREFIX}:${walletPublicKey}`
}

export async function getStoredOnboardingSession(
  walletPublicKey: string,
): Promise<StoredOnboardingSession | null> {
  try {
    const raw = await redis.get<StoredOnboardingSession>(redisKey(walletPublicKey))
    if (!raw || typeof raw !== 'object') return null
    if (!raw.customerId || !raw.bankAccountId) return null
    return raw
  } catch (e) {
    console.warn('[onboarding-store] Redis get failed:', e)
    return null
  }
}

export async function saveStoredOnboardingSession(
  data: Omit<StoredOnboardingSession, 'updatedAt'>,
): Promise<void> {
  try {
    const record: StoredOnboardingSession = {
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await redis.set(redisKey(data.walletPublicKey), record, { ex: TTL_SEC })
  } catch (e) {
    console.warn('[onboarding-store] Redis set failed:', e)
  }
}

export async function clearStoredOnboardingSession(walletPublicKey: string): Promise<void> {
  try {
    await redis.del(redisKey(walletPublicKey))
  } catch (e) {
    console.warn('[onboarding-store] Redis del failed:', e)
  }
}
