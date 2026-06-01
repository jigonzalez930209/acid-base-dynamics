import type { RedoxFields } from './types'

type Props = {
  data: RedoxFields
  onChange: (next: RedoxFields) => void
  inputClassName: string
}

function Field({
  label,
  value,
  onChange,
  inputClassName,
  step,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  inputClassName: string
  step: string
  min?: number
  max?: number
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      <input
        required
        type="number"
        step={step}
        min={min}
        max={max}
        className={inputClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function RedoxBlock({ data, onChange, inputClassName }: Props) {
  const set = (patch: Partial<RedoxFields>) => onChange({ ...data, ...patch })

  return (
    <div className="space-y-6">
      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Parámetros de la valoración</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Normalidad de tiosulfato de sodio (mol/L)"
            value={data.nTiosulfato}
            onChange={(v) => set({ nTiosulfato: v })}
            inputClassName={inputClassName}
            step="0.0001"
            min={0.001}
            max={2}
          />
          <Field
            label="Normalidad del KI₃ (mol/L)"
            value={data.nKi3}
            onChange={(v) => set({ nKi3: v })}
            inputClassName={inputClassName}
            step="0.0001"
            min={0.001}
            max={2}
          />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Muestra 1</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Peso muestra 1 (g)"
            value={data.pesoM1}
            onChange={(v) => set({ pesoM1: v })}
            inputClassName={inputClassName}
            step="0.0001"
            min={0.0001}
            max={10}
          />
          <Field
            label="Ácido ascórbico % 1"
            value={data.acidoPctM1}
            onChange={(v) => set({ acidoPctM1: v })}
            inputClassName={inputClassName}
            step="0.01"
            min={0}
            max={100}
          />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Muestra 2</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Peso muestra 2 (g)"
            value={data.pesoM2}
            onChange={(v) => set({ pesoM2: v })}
            inputClassName={inputClassName}
            step="0.0001"
            min={0.0001}
            max={10}
          />
          <Field
            label="Ácido ascórbico % 2"
            value={data.acidoPctM2}
            onChange={(v) => set({ acidoPctM2: v })}
            inputClassName={inputClassName}
            step="0.01"
            min={0}
            max={100}
          />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Volúmenes Na₂S₂O₃</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Volumen Na₂S₂O₃ 1 (mL)"
            value={data.volS2o3_1}
            onChange={(v) => set({ volS2o3_1: v })}
            inputClassName={inputClassName}
            step="0.01"
            min={0}
            max={200}
          />
          <Field
            label="Volumen Na₂S₂O₃ 2 (mL)"
            value={data.volS2o3_2}
            onChange={(v) => set({ volS2o3_2: v })}
            inputClassName={inputClassName}
            step="0.01"
            min={0}
            max={200}
          />
        </div>
      </fieldset>
    </div>
  )
}
