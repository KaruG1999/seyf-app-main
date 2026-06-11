import type { UserMovement } from '@/lib/seyf/user-movements-types'

const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const pointsFormatter = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const chainAmountFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 7 })

export const formatMXN = (amount: number): string =>
  mxnFormatter.format(amount)

export const formatPuntos = (points: number): string =>
  pointsFormatter.format(points)

export const formatMXNToParts = (amount: number) =>
  mxnFormatter.formatToParts(amount)

export function splitCurrencyForDisplay(amount: number): { main: string; cents: string } {
  const parts = formatMXNToParts(amount)
  let main = ''
  let fraction = ''
  let decimalSep = '.'
  for (const p of parts) {
    if (p.type === 'fraction') { fraction = p.value; continue }
    if (p.type === 'decimal')  { decimalSep = p.value; continue }
    main += p.value
  }
  return { main: main.trim(), cents: fraction ? `${decimalSep}${fraction}` : '' }
}

export function formatLoUltimoMonto(mov: UserMovement): string {
  const code = mov.chainAssetCode?.trim()
  const sign = mov.monto < 0 ? '− ' : mov.monto > 0 ? '+' : ''
  if (code) {
    const abs = Math.abs(mov.monto)
    const n = chainAmountFormatter.format(abs)
    return `${sign}${n} ${code}`
  }
  return `${sign}${formatMXN(Math.abs(mov.monto))}`
}

function numberToSpanishWords(n: number): string {
  if (n === 0) return 'cero'

  const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  const tensUnderThirty = ['', 'diez', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

  function convertGroup(num: number): string {
    let result = ''
    if (num >= 100) {
      if (num === 100) {
        return 'cien'
      }
      result += hundreds[Math.floor(num / 100)] + ' '
      num %= 100
    }
    if (num >= 30) {
      result += tens[Math.floor(num / 10)] + ' '
      num %= 10
      if (num > 0) {
        result += 'y ' + units[num] + ' '
      }
    } else if (num >= 20) {
      result += tensUnderThirty[num] + ' '
    } else if (num >= 10) {
      result += teens[num - 10] + ' '
    } else if (num > 0) {
      result += units[num] + ' '
    }
    return result.trim()
  }

  let result = ''
  let integerPart = Math.floor(n)

  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000)
    if (millions === 1) {
      result += 'un millón '
    } else {
      result += convertGroup(millions) + ' millones '
    }
    integerPart %= 1000000
  }

  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000)
    if (thousands === 1) {
      result += 'mil '
    } else {
      result += convertGroup(thousands) + ' mil '
    }
    integerPart %= 1000
  }

  if (integerPart > 0) {
    result += convertGroup(integerPart) + ' '
  }

  return result.trim()
}

export function mxnToSpanishWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const integerPart = Math.floor(rounded)
  const cents = Math.round((rounded - integerPart) * 100)

  let words = ''
  if (integerPart === 0) {
    words = 'cero pesos'
  } else if (integerPart === 1) {
    words = 'un peso'
  } else {
    words = `${numberToSpanishWords(integerPart)} pesos`
  }

  words = words
    .replace(/\bveintiuno pesos\b/g, 'veintiún pesos')
    .replace(/\buno pesos\b/g, 'un pesos')
    .replace(/\b(\w+) y uno pesos\b/g, '$1 y un pesos')

  if (cents > 0) {
    const centsWords = numberToSpanishWords(cents)
    words += ` con ${centsWords} centavo${cents === 1 ? '' : 's'}`
  }

  return words
}

