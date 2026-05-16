/** Contactos SPEI guardados en el dispositivo (retiros — verificación contra cuenta en Identidad). */

export type SpeiWithdrawContact = {
  id: string
  label: string
  beneficiaryName: string
  clabe: string
  createdAt: string
}

const STORAGE_KEY = 'seyf:spei-withdraw-contacts:v1'

function assertBrowser() {
  if (typeof window === 'undefined') return false
  return true
}

export function normalizeClabeDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 18)
}

export function isValidMexicanClabe(digits: string): boolean {
  return /^\d{18}$/.test(digits)
}

export function loadSpeiWithdrawContacts(): SpeiWithdrawContact[] {
  if (!assertBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: SpeiWithdrawContact[] = []
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue
      const o = row as Record<string, unknown>
      const id = typeof o.id === 'string' ? o.id : ''
      const label = typeof o.label === 'string' ? o.label.trim() : ''
      const beneficiaryName =
        typeof o.beneficiaryName === 'string' ? o.beneficiaryName.trim() : ''
      const clabe = normalizeClabeDigits(
        typeof o.clabe === 'string' ? o.clabe : '',
      )
      const createdAt =
        typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString()
      if (!id || !label || !isValidMexicanClabe(clabe)) continue
      out.push({ id, label, beneficiaryName, clabe, createdAt })
    }
    return out
  } catch {
    return []
  }
}

export function saveSpeiWithdrawContacts(contacts: SpeiWithdrawContact[]) {
  if (!assertBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}

export function addSpeiWithdrawContact(input: {
  label: string
  beneficiaryName: string
  clabeDigits: string
}): SpeiWithdrawContact | null {
  const clabe = normalizeClabeDigits(input.clabeDigits)
  if (!isValidMexicanClabe(clabe)) return null
  const label = input.label.trim()
  if (!label) return null
  const contact: SpeiWithdrawContact = {
    id: crypto.randomUUID(),
    label,
    beneficiaryName: input.beneficiaryName.trim(),
    clabe,
    createdAt: new Date().toISOString(),
  }
  const list = loadSpeiWithdrawContacts()
  saveSpeiWithdrawContacts([contact, ...list.filter((c) => c.clabe !== clabe)])
  return contact
}

export function removeSpeiWithdrawContact(id: string) {
  const list = loadSpeiWithdrawContacts().filter((c) => c.id !== id)
  saveSpeiWithdrawContacts(list)
}

/**
 * Compara la CLABE del contacto con el hint de Etherfuse (p. ej. abreviada).
 * Si no hay dígitos suficientes en el hint, no falla (true).
 */
export function contactClabeMatchesAbbrHint(
  clabe18: string,
  abbrClabe: string | null | undefined,
): boolean {
  if (!abbrClabe?.trim()) return true
  const hintDigits = abbrClabe.replace(/\D/g, '')
  if (hintDigits.length >= 18) return clabe18 === hintDigits
  if (hintDigits.length >= 4) {
    return clabe18.endsWith(hintDigits.slice(-4))
  }
  return true
}
