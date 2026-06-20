import { describe, it, expect } from 'vitest'
import {
  parseIntensiteit,
  parseLactaat,
  parseGewicht,
  intensiteitLabel,
  intensiteitAfgeleid,
  formatIntensiteit,
} from './invoer'

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

describe('parseIntensiteit — lopen (snelheid km/u)', () => {
  it('leest een snelheid-getal (komma toegestaan)', () => {
    expect(parseIntensiteit('running', '12,5')).toBeCloseTo(12.5, 6)
  })
  it('weigert pace-notatie, nul, negatief en leeg', () => {
    expect(parseIntensiteit('running', '5:30')).toBeNull()
    expect(parseIntensiteit('running', '0')).toBeNull()
    expect(parseIntensiteit('running', '-3')).toBeNull()
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

describe('parseGewicht', () => {
  it('leest gewicht, weigert leeg/negatief', () => {
    expect(parseGewicht('72,5')).toBeCloseTo(72.5, 6)
    expect(parseGewicht('')).toBeNull()
    expect(parseGewicht('-1')).toBeNull()
  })
})

describe('formatIntensiteit', () => {
  it('fietsen toont W; met gewicht ook W/kg', () => {
    expect(formatIntensiteit('cycling', 250)).toBe('250 W')
    expect(formatIntensiteit('cycling', 250, 80)).toMatch(/W\/kg/)
  })
  it('lopen toont pace + km/u (geen W/kg)', () => {
    expect(formatIntensiteit('running', 12)).toMatch(/km\/u/)
    expect(formatIntensiteit('running', 12, 80)).not.toMatch(/W\/kg/)
  })
})

describe('intensiteitLabel / afgeleid', () => {
  it('label verschilt per sport (lopen = km/u)', () => {
    expect(intensiteitLabel('cycling')).toMatch(/W/)
    expect(intensiteitLabel('running')).toMatch(/km\/u/)
  })
  it('afgeleide bij lopen toont pace, bij fietsen niets', () => {
    expect(intensiteitAfgeleid('running', 12)).toMatch(/\/km/)
    expect(intensiteitAfgeleid('cycling', 250)).toBeNull()
  })
})
