import { memo } from 'react'
import { Controller, useFormContext, type FieldPath } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { ChemicalFormula } from '@/components/shared/chemical-formula'
import { INDICADORES, isAcidBaseTechnique, TECNICA_OPTIONS, titrationTipoLabel } from './constants'
import { FormField, labInputClassName } from './form-field'
import { LabSelect } from './lab-select'
import type { LaboratoryFormValues, TitrationFields } from './schemas'
import { useFieldError, useFormSubmitting } from './use-field-error'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold border-b border-border/60 pb-1.5 mb-1">{children}</h2>
}

function titrationDefaults(tipo: string): TitrationFields {
  return { tipo, normalidad: '', indicador: '', v1: '', v2: '' }
}

function DniField() {
  const { control } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError('dni')

  return (
    <FormField label="DNI (sin puntos)" error={error}>
      <Controller
        name="dni"
        control={control}
        render={({ field }) => (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            autoComplete="off"
            disabled={isSubmitting}
            aria-invalid={!!error}
            className={labInputClassName}
            placeholder="Ej: 12345678"
            value={field.value}
            onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onBlur={field.onBlur}
          />
        )}
      />
    </FormField>
  )
}

export const GeneralSection = memo(function GeneralSection() {
  return (
    <section className="space-y-3">
      <SectionHeading>Datos generales</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-5">
        <DniField />
      </div>
    </section>
  )
})

function MuestraFosfatoField() {
  const { register } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError('muestraFosfato')

  return (
    <FormField label="Muestra fosfatos" error={error}>
      <input
        type="text"
        disabled={isSubmitting}
        aria-invalid={!!error}
        className={labInputClassName}
        {...register('muestraFosfato')}
      />
    </FormField>
  )
}

function PhField() {
  const { register } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError('ph')

  return (
    <FormField label="pH inicial" error={error}>
      <input
        type="number"
        step="0.01"
        min={0}
        max={14}
        disabled={isSubmitting}
        aria-invalid={!!error}
        className={labInputClassName}
        {...register('ph')}
      />
    </FormField>
  )
}

function TecnicaField({ onTecnicaChange }: { onTecnicaChange: (val: string) => void }) {
  const { control } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError('tecnica')

  return (
    <Controller
      name="tecnica"
      control={control}
      render={({ field }) => (
        <>
          <FormField label="Técnica asignada" error={error} className="max-w-md">
            <LabSelect
              value={field.value}
              onChange={val => {
                field.onChange(val)
                onTecnicaChange(val)
              }}
              onBlur={field.onBlur}
              options={TECNICA_OPTIONS}
              disabled={isSubmitting}
              aria-invalid={!!error}
            />
          </FormField>
          {isAcidBaseTechnique(field.value) && (
            <div className="space-y-4 md:space-y-5">
              <TitrationFields
                prefix="t1"
                title="Primera valoración"
                tipoLabel={titrationTipoLabel(field.value, 't1')}
              />
              <TitrationFields
                prefix="t2"
                title="Segunda valoración"
                tipoLabel={titrationTipoLabel(field.value, 't2')}
              />
            </div>
          )}
        </>
      )}
    />
  )
}

type TitrationPrefix = 't1' | 't2'

function TitrationField({
  prefix,
  name,
  label,
  type = 'number',
  step,
  min,
  max,
}: {
  prefix: TitrationPrefix
  name: 'normalidad' | 'v1' | 'v2'
  label: string
  type?: 'number'
  step: string
  min?: number
  max?: number
}) {
  const fieldName = `${prefix}.${name}` as FieldPath<LaboratoryFormValues>
  const { register } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError(fieldName)

  return (
    <FormField label={label} error={error}>
      <input
        type={type}
        step={step}
        min={min}
        max={max}
        disabled={isSubmitting}
        aria-invalid={!!error}
        className={labInputClassName}
        {...register(fieldName)}
      />
    </FormField>
  )
}

function IndicadorField({ prefix }: { prefix: TitrationPrefix }) {
  const fieldName = `${prefix}.indicador` as FieldPath<LaboratoryFormValues>
  const { control } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError(fieldName)

  return (
    <FormField label="Indicador" error={error}>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <LabSelect
            value={field.value as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={INDICADORES.map(ind => ({ value: ind, label: ind }))}
            disabled={isSubmitting}
            aria-invalid={!!error}
          />
        )}
      />
    </FormField>
  )
}

function TitrationFields({
  prefix,
  title,
  tipoLabel,
}: {
  prefix: TitrationPrefix
  title: string
  tipoLabel: string
}) {
  return (
    <fieldset className="border rounded-md p-4 space-y-3 md:space-y-4">
      <legend className="text-sm font-semibold px-2">
        {title} ({tipoLabel})
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start gap-x-4 gap-y-3 md:gap-5">
        <TitrationField prefix={prefix} name="normalidad" label="Normalidad (N)" step="0.0001" min={0.001} max={2} />
        <IndicadorField prefix={prefix} />
        <TitrationField prefix={prefix} name="v1" label="Volumen 1 (mL)" step="0.01" min={0} max={200} />
        <TitrationField prefix={prefix} name="v2" label="Volumen 2 (mL)" step="0.01" min={0} max={200} />
      </div>
    </fieldset>
  )
}

type FosfatoSectionProps = {
  onTecnicaChange: (val: string) => void
}

export const FosfatoSection = memo(function FosfatoSection({ onTecnicaChange }: FosfatoSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeading>Titulación de fosfatos (ácido-base)</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-5 max-w-2xl">
        <MuestraFosfatoField />
        <PhField />
      </div>
      <TecnicaField onTecnicaChange={onTecnicaChange} />
    </section>
  )
})

function RedoxNumField({
  name,
  label,
  step,
  min,
  max,
}: {
  name: FieldPath<LaboratoryFormValues>
  label: React.ReactNode
  step: string
  min?: number
  max?: number
}) {
  const { register } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError(name)

  return (
    <FormField label={label} error={error}>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        disabled={isSubmitting}
        aria-invalid={!!error}
        className={labInputClassName}
        {...register(name)}
      />
    </FormField>
  )
}

function MuestraRedoxField() {
  const { register } = useFormContext<LaboratoryFormValues>()
  const isSubmitting = useFormSubmitting()
  const error = useFieldError('muestraRedox')

  return (
    <FormField label="Número de muestra Redox" error={error}>
      <input
        type="text"
        inputMode="numeric"
        disabled={isSubmitting}
        aria-invalid={!!error}
        className={labInputClassName}
        placeholder="Ej: 2"
        {...register('muestraRedox')}
      />
    </FormField>
  )
}

export const RedoxSection = memo(function RedoxSection() {
  return (
    <section className="space-y-3">
      <SectionHeading>Titulación Redox</SectionHeading>
      <div className="space-y-4">
        <MuestraRedoxField />

        <fieldset className="border rounded-md p-4 space-y-3">
          <legend className="text-sm font-semibold px-2">Parámetros de la valoración</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-4">
            <RedoxNumField
              name="redox.nTiosulfato"
              label={
                <>
                  Normalidad de <ChemicalFormula formula="Na2S2O3" className="text-sm" /> (mol/L)
                </>
              }
              step="0.0001"
              min={0.001}
              max={2}
            />
            <RedoxNumField name="redox.nKi3" label="Normalidad del KI₃ (mol/L)" step="0.0001" min={0.001} max={2} />
          </div>
        </fieldset>

        <fieldset className="border rounded-md p-4 space-y-3">
          <legend className="text-sm font-semibold px-2">Muestra 1</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-4">
            <RedoxNumField name="redox.pesoM1" label="Peso muestra 1 (g)" step="0.0001" min={0.0001} max={10} />
            <RedoxNumField name="redox.acidoPctM1" label="Ácido ascórbico % 1" step="0.01" min={0} max={200} />
          </div>
        </fieldset>

        <fieldset className="border rounded-md p-4 space-y-3">
          <legend className="text-sm font-semibold px-2">Muestra 2</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-4">
            <RedoxNumField name="redox.pesoM2" label="Peso muestra 2 (g)" step="0.0001" min={0.0001} max={10} />
            <RedoxNumField name="redox.acidoPctM2" label="Ácido ascórbico % 2" step="0.01" min={0} max={200} />
          </div>
        </fieldset>

        <fieldset className="border rounded-md p-4 space-y-3">
          <legend className="text-sm font-semibold px-2 inline-flex items-center gap-1">
            Volúmenes <ChemicalFormula formula="Na2S2O3" className="text-sm" />
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-3 md:gap-4">
            <RedoxNumField
              name="redox.volS2o3_1"
              label={
                <>
                  Volumen <ChemicalFormula formula="Na2S2O3" className="text-sm" /> 1 (mL)
                </>
              }
              step="0.01"
              min={0}
              max={200}
            />
            <RedoxNumField
              name="redox.volS2o3_2"
              label={
                <>
                  Vol. <ChemicalFormula formula="Na2S2O3" className="text-sm" /> 2 (mL)
                </>
              }
              step="0.01"
              min={0}
              max={200}
            />
          </div>
        </fieldset>
      </div>
    </section>
  )
})

function SubmitButton() {
  const isSubmitting = useFormSubmitting()

  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? 'Enviando…' : 'Enviar fosfatos y Redox'}
    </Button>
  )
}

export { SubmitButton, titrationDefaults }
