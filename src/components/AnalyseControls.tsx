import type { AnalyseConfig, LT2Methode } from '../lib/analyse'

interface Props {
  config: AnalyseConfig
  graadAdvies: number | null
  onChange: (c: AnalyseConfig) => void
}

export function AnalyseControls({ config, graadAdvies, onChange }: Props) {
  const set = (patch: Partial<AnalyseConfig>) => onChange({ ...config, ...patch })

  return (
    <div className="analyse-controls">
      <label className="veld">
        <span>LT2-methode</span>
        <select
          value={config.lt2Methode}
          onChange={(e) => set({ lt2Methode: e.target.value as LT2Methode })}
        >
          <option value="moddmax">Modified-Dmax</option>
          <option value="dmax">Dmax</option>
        </select>
      </label>

      <label className="veld">
        <span>OBLA-niveau (mmol/L)</span>
        <select value={config.oblaNiveau} onChange={(e) => set({ oblaNiveau: Number(e.target.value) })}>
          <option value={2}>2,0</option>
          <option value={3}>3,0</option>
          <option value={4}>4,0</option>
        </select>
      </label>

      <label className="veld">
        <span>LT1-drempel (baseline +)</span>
        <select value={config.lt1Delta} onChange={(e) => set({ lt1Delta: Number(e.target.value) })}>
          <option value={0.5}>0,5</option>
          <option value={1}>1,0</option>
          <option value={1.5}>1,5</option>
        </select>
      </label>

      <label className="veld">
        <span>Polynoomgraad{graadAdvies ? ` (advies: ${graadAdvies})` : ''}</span>
        <select
          value={String(config.graad)}
          onChange={(e) => set({ graad: e.target.value === 'auto' ? 'auto' : Number(e.target.value) })}
        >
          <option value="auto">Auto (advies)</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>
    </div>
  )
}
