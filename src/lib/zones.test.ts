import { describe, it, expect } from 'vitest'
import { drempelzones, trainingszones, zoneHr } from './zones'

describe('drempelzones', () => {
  it('drie zones, open onder/boven LT1/LT2', () => {
    const z = drempelzones(200, 280)
    expect(z).toHaveLength(3)
    expect(z[0]).toMatchObject({ min: null, max: 200 })
    expect(z[1]).toMatchObject({ min: 200, max: 280 })
    expect(z[2]).toMatchObject({ min: 280, max: null })
  })
})

describe('trainingszones (5-zone)', () => {
  const z = trainingszones(200, 280)

  it('vijf zones met LT1−10% en het middelpunt', () => {
    expect(z).toHaveLength(5)
    expect(z[0]).toMatchObject({ code: 'A1', min: null, max: 180 }) // LT1*0.9
    expect(z[1]).toMatchObject({ code: 'A2', min: 180, max: 200 })
    expect(z[2]).toMatchObject({ code: 'A2+', min: 200, max: 240 }) // mid = 240
    expect(z[3]).toMatchObject({ code: 'B', min: 240, max: 280 })
    expect(z[4]).toMatchObject({ code: 'C', min: 280, max: null })
  })

  it('zones sluiten op elkaar aan', () => {
    for (let i = 1; i < z.length; i++) {
      expect(z[i].min).toBe(z[i - 1].max)
    }
  })
})

describe('zoneHr', () => {
  const hf = [
    { x: 100, v: 120 },
    { x: 200, v: 150 },
    { x: 300, v: 180 },
  ]

  it('interpoleert HR op de zonegrenzen', () => {
    const r = zoneHr(hf, { code: '2', naam: '', min: 150, max: 250 })
    expect(r.min!).toBeCloseTo(135, 1) // 120 + 0,5·(150−120)
    expect(r.max!).toBeCloseTo(165, 1) // 150 + 0,5·(180−150)
  })

  it('open grens geeft null voor die kant', () => {
    expect(zoneHr(hf, { code: '1', naam: '', min: null, max: 200 }).min).toBeNull()
    expect(zoneHr(hf, { code: '3', naam: '', min: 200, max: null }).max).toBeNull()
  })
})
