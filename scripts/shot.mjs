// Visuele check: maak full-page screenshots van een draaiende app op meerdere schermbreedtes.
// Gebruik: node scripts/shot.mjs <url> <label> [outDir]
// Vereist een draaiende dev/preview-server. Onderdeel van de visuele-check-tooling (Slice 3b).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] || 'http://localhost:5173/'
const label = process.argv[3] || 'shot'
const outDir = process.argv[4] || '.screenshots'
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const file = `${outDir}/${label}-${vp.name}.png`
  await page.screenshot({ path: file, fullPage: true })
  console.log('saved', file)
  await ctx.close()
}
await browser.close()
