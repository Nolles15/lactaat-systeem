import { describe, it, expect } from 'vitest'
import { parseIntensiteit, parseLactaat, intensiteitLabel } from './invoer'

describe('parseIntensiteit — fietsen (Watt)', () => {
  it('leest een geheel getal', () => {
    expect(parseIntensiteit('cycling', '250')).toBe(250)
  })
  it('accepteert een komma als decimaalteken', () => {
    expect(parseIntensiteit('cycling', '250,5')).toBeCloseTo(250.5, 6)
  })
  it('weigert nul, negatief, leeg en onzin', () => {
    expect(parseIntensiteit('cycling', '0')).toBeNull()
    expect(parseIntensiteit('cycling', '-10')).toBeNull()
    expect(parseIntensiteit('cycling', '')).toBeNull()
    expect(parseIntensiteit('cycling', 'abc')).toBeNull()
  })
})

describe('parseIntensiteit — lopen (pace → km/h)', () => {
  it('zet 5:30 om naar km/h', () => {
    expect(parseIntensiteit('running', '5:30')).toBeCloseTo(10.909, 3)
  })
  it('weigert ongeldige pace (seconden > 59, geen dubbele punt)', () => {
    expect(parseIntensiteit('running', '5:75')).toBeNull()
    expect(parseIntensiteit('running', '550')).toBeNull()
    expect(parseIntensiteit('running', '')).toBeNull()
  })
})

describe('parseLactaat', () => {
  it('leest waarden met komma of punt', () => {
    expect(parseLactaat('2,5')).toBeCloseTo(2.5, 6)
    expect(parseLactaat('4.0')).toBeCloseTo(4.0, 6)
  })
  it('weigert negatief en leeg', () => {
    expect(parseLactaat('-1')).toBeNull()
    expect(parseLactaat('')).toBeNull()
  })
})

describe('intensiteitLabel', () => {
  it('verschilt per sport', () => {
    expect(intensiteitLabel('cycling')).toMatch(/W/)
    expect(intensiteitLabel('running')).toMatch(/min\/km/)
  })
})
