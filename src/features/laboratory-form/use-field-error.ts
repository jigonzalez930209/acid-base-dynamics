import { get, useFormContext, useFormState, type FieldError, type FieldPath } from 'react-hook-form'
import type { LaboratoryFormValues } from './schemas'

/** Suscripción granular: solo re-renderiza cuando cambia el estado de este campo. */
export function useFieldError(name: FieldPath<LaboratoryFormValues>): FieldError | undefined {
  const { control } = useFormContext<LaboratoryFormValues>()
  const { errors, isSubmitted, touchedFields } = useFormState({
    control,
    name,
    exact: true,
  })

  const error = get(errors, name) as FieldError | undefined
  const isTouched = Boolean(get(touchedFields, name))

  return error && (isTouched || isSubmitted) ? error : undefined
}

export function useFormSubmitting(): boolean {
  const { control } = useFormContext<LaboratoryFormValues>()
  return useFormState({ control }).isSubmitting
}
