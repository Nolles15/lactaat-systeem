import { describe, it, expect } from 'vitest'
import { naamGeldig, legeDeelnemer, legeSessie, actieveModules, SESSIE_VERSIE } from './sessie'
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

describe('legeSessie', () => {
  it('heeft een versie en een lege lactaat-module', () => {
    const s = legeSessie('2026-06-20')
    expect(s.versie).toBe(SESSIE_VERSIE)
    expect(s.test.datum).toBe('2026-06-20')
    expect(s.test.sport).toBe('cycling')
    expect(s.modules.lactaat).toBeDefined()
    expect(s.modules.lactaat!.meetpunten).toHaveLength(5)
    expect(naamGeldig(s.deelnemer.naam)).toBe(false)
  })
})

describe('actieveModules', () => {
  it('gebruikt de expliciete vlag', () => {
    expect(actieveModules(legeSessie('2026-06-20'))).toEqual({ lactaat: true, vo2max: false })
  })
  it('valt zonder vlag terug op aanwezige modules', () => {
    const zonderVlag = { ...legeSessie('2026-06-20'), actief: undefined }
    expect(actieveModules(zonderVlag)).toEqual({ lactaat: true, vo2max: false })
  })
})

describe('apparatuurVoor', () => {
  it('geeft per sport een niet-lege omschrijving', () => {
    expect(apparatuurVoor('cycling')).not.toBe('')
    expect(apparatuurVoor('running')).not.toBe('')
    expect(apparatuurVoor('rowing')).not.toBe('')
  })
})
