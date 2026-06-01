import { useFormContext } from 'react-hook-form'
import { FormField, labInputClassName } from './form-field'
import type { LaboratoryFormValues } from './schemas'

type NumFieldProps = {
  name: `redox.${keyof LaboratoryFormValues['redox']}`
  label: string
  step: string
  min?: number
  max?: number
}

function NumField({ name, label, step, min, max }: NumFieldProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<LaboratoryFormValues>()
  const fieldKey = name.replace('redox.', '') as keyof LaboratoryFormValues['redox']
  const err = errors.redox?.[fieldKey]

  return (
    <FormField label={label} error={err}>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        disabled={isSubmitting}
        aria-invalid={!!err}
        className={labInputClassName}
        {...register(name)}
      />
    </FormField>
  )
}

export function RedoxBlock() {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<LaboratoryFormValues>()

  return (
    <div className="space-y-6">
      <FormField label="Número de muestra Redox" error={errors.muestraRedox}>
        <input
          type="text"
          inputMode="numeric"
          disabled={isSubmitting}
          aria-invalid={!!errors.muestraRedox}
          className={labInputClassName}
          placeholder="Ej: 2"
          {...register('muestraRedox')}
        />
      </FormField>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Parámetros de la valoración</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumField name="redox.nTiosulfato" label="Normalidad de tiosulfato de sodio (mol/L)" step="0.0001" min={0.001} max={2} />
          <NumField name="redox.nKi3" label="Normalidad del KI₃ (mol/L)" step="0.0001" min={0.001} max={2} />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Muestra 1</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumField name="redox.pesoM1" label="Peso muestra 1 (g)" step="0.0001" min={0.0001} max={10} />
          <NumField name="redox.acidoPctM1" label="Ácido ascórbico % 1" step="0.01" min={0} max={100} />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Muestra 2</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumField name="redox.pesoM2" label="Peso muestra 2 (g)" step="0.0001" min={0.0001} max={10} />
          <NumField name="redox.acidoPctM2" label="Ácido ascórbico % 2" step="0.01" min={0} max={100} />
        </div>
      </fieldset>

      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">Volúmenes Na₂S₂O₃</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumField name="redox.volS2o3_1" label="Volumen Na₂S₂O₃ 1 (mL)" step="0.01" min={0} max={200} />
          <NumField name="redox.volS2o3_2" label="Vol Na₂S₂O₃ 2 (mL)" step="0.01" min={0} max={200} />
        </div>
      </fieldset>
    </div>
  )
}
