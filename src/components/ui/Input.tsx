import {
  Children,
  cloneElement,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

type FieldProps = {
  id: string
  label: string
  hint?: string
  error?: boolean
  children: ReactNode
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  const hintId = `${id}-hint`
  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const el = child as ReactElement<{
      id?: string
      'aria-describedby'?: string
      'aria-invalid'?: boolean | 'true' | 'false'
    }>
    return cloneElement(el, {
      id: el.props.id ?? id,
      'aria-describedby': hint ? hintId : el.props['aria-describedby'],
      'aria-invalid': error || el.props['aria-invalid'] ? true : undefined,
    })
  })

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {hint ? (
        <p className={error ? 'field__hint field__hint--error' : 'field__hint'} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />
}
