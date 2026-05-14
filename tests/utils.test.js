import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cn,
  debounce,
  formatDate,
  formatRelativeTime,
  generateId,
  getCategoryIcon,
  getInitials,
  getStatusColor,
  isPast,
  isUpcoming,
  truncateText,
} from '../src/lib/utils'

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-14T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats ISO strings and Date instances', () => {
    expect(formatDate('2026-05-20T10:30:00Z', 'yyyy-MM-dd')).toBe('2026-05-20')
    expect(formatDate(new Date('2026-05-20T10:30:00Z'), 'MMM d, yyyy')).toBe('May 20, 2026')
  })

  it('uses Arabic locale when requested', () => {
    expect(formatDate('2026-05-20T10:30:00Z', 'PPP', 'ar')).toContain('2026')
  })

  it('formats relative time with a suffix', () => {
    expect(formatRelativeTime('2026-05-14T12:10:00Z')).toBe('in 10 minutes')
    expect(formatRelativeTime(new Date('2026-05-14T11:58:00Z'))).toBe('2 minutes ago')
  })

  it('identifies future and past dates from strings and Date instances', () => {
    expect(isUpcoming('2026-05-14T12:00:01Z')).toBe(true)
    expect(isUpcoming(new Date('2026-05-14T11:59:59Z'))).toBe(false)
    expect(isPast('2026-05-14T11:59:59Z')).toBe(true)
    expect(isPast(new Date('2026-05-14T12:00:01Z'))).toBe(false)
  })
})

describe('text helpers', () => {
  it('truncates text longer than the requested length', () => {
    expect(truncateText('Nashrik campus events', 7)).toBe('Nashrik...')
  })

  it('returns short or empty text unchanged', () => {
    expect(truncateText('Short', 10)).toBe('Short')
    expect(truncateText('', 10)).toBe('')
    expect(truncateText(null, 10)).toBe(null)
  })

  it('builds initials from names and falls back for missing values', () => {
    expect(getInitials('Nashrik Student Club')).toBe('NS')
    expect(getInitials('aya')).toBe('A')
    expect(getInitials()).toBe('?')
  })
})

describe('styling helpers', () => {
  it('returns status classes for known statuses', () => {
    expect(getStatusColor('published')).toBe('bg-brand-400/20 text-brand-400')
    expect(getStatusColor('cancelled')).toBe('bg-status-error/20 text-status-error')
    expect(getStatusColor('pending')).toBe('bg-status-warning/20 text-status-warning')
  })

  it('falls back to neutral status classes for unknown statuses', () => {
    expect(getStatusColor('archived')).toBe('bg-gray-500/20 text-gray-400')
    expect(getStatusColor()).toBe('bg-gray-500/20 text-gray-400')
  })

  it('returns configured category icons with a default icon fallback', () => {
    expect(getCategoryIcon('academic')).not.toBe(getCategoryIcon('unknown'))
    expect(getCategoryIcon('sports')).not.toBe(getCategoryIcon('unknown'))
    expect(getCategoryIcon('unknown')).toBeTruthy()
  })

  it('joins truthy class names only', () => {
    expect(cn('btn', false, undefined, 'active', '', null, 'rounded')).toBe('btn active rounded')
  })
})

describe('id and timer helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('uses crypto.randomUUID when available', () => {
    const randomUUID = vi.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-id')

    expect(generateId()).toBe('fixed-id')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('falls back to Math.random when randomUUID is unavailable', () => {
    const originalRandomUUID = crypto.randomUUID
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    })

    expect(generateId()).toBe('4fzzzxjylrx')
    expect(random).toHaveBeenCalledOnce()

    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      value: originalRandomUUID,
    })
  })

  it('debounces calls until the delay has passed', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 250)

    debounced('first')
    vi.advanceTimersByTime(100)
    debounced('second')
    vi.advanceTimersByTime(249)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('second')
  })
})
