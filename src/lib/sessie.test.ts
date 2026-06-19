import { describe, it, expect } from 'vitest'
import { naamGeldig, legeDeelnemer } from './sessie'
import { apparatuurVoor } from './apparatuur'

describe('naamGeldig', () => {
  it('leeg of alleen spaties = ongeldig', () => {
    expect(naamGeldig('')).toBe(false)
    expect(naamGeldig('   ')).toBe(false)
  })
  it('ingevulde naam = geldig', () => {
    expect(naamGeldig('Pietje')).toBe(true)
  })
  it('lege deelnemer heeft een lege naam', () => {
    expect(naamGeldig(legeDeelnemer().naam)).toBe(false)
  })
})

describe('apparatuurVoor', () => {
  it('geeft per sport een niet-lege omschrijving', () => {
    expect(apparatuurVoor('cycling')).not.toBe('')
    expect(apparatuurVoor('running')).not.toBe('')
    expect(apparatuurVoor('rowing')).not.toBe('')
  })
})
