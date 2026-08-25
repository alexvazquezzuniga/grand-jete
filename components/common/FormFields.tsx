const labels: Record<string, string> = {
  // Estados
  active: 'Activo',
  inactive: 'Inactivo',
  paused: 'Pausado',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
  completed: 'Completado',
  closed: 'Cerrado',

  // Esquemas de pago de maestros
  monthly: 'Mensual',
  biweekly: 'Quincenal',
  weekly: 'Semanal',
  per_hour: 'Por hora',
  per_class: 'Por clase',
  per_student: 'Por alumno',
  percentage: 'Porcentaje',

  // Formas de pago
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  deposit: 'Depósito',

  // Conceptos de cobro
  monthly_fee: 'Mensualidad',
  registration: 'Inscripción',
  costume: 'Vestuario',
  special_class: 'Clase especial',
  rent: 'Renta',
  rehearsal: 'Ensayos',
  other: 'Otro',

  // Conceptos anteriores / compatibilidad
  tuition: 'Mensualidad',
  enrollment: 'Inscripción',
  reenrollment: 'Reinscripción',

  // Otros
  yes: 'Sí',
  no: 'No',
}

function displayLabel(value: string) {
  return labels[value] || value
}

export function F({
  name,
  label,
  type = 'text',
  value = '',
  required = false,
}: any) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        name={name}
        type={type}
        defaultValue={value ?? ''}
        required={required}
        step={type === 'number' ? '.01' : undefined}
      />
    </div>
  )
}

export function Sel({
  name,
  label,
  value,
  options,
}: any) {
  return (
    <div className="field">
      <label>{label}</label>

      <select
        name={name}
        defaultValue={value}
      >
        {options.map((option: any) => {
          // Permite tanto:
          // ['active', 'inactive']
          // como:
          // [{ value: 'active', label: 'Activo' }]

          const optionValue =
            typeof option === 'string'
              ? option
              : option.value

          const optionLabel =
            typeof option === 'string'
              ? displayLabel(option)
              : option.label

          return (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export function TA({
  name,
  label,
  value = '',
}: any) {
  return (
    <div className="field full">
      <label>{label}</label>

      <textarea
        name={name}
        defaultValue={value ?? ''}
      />
    </div>
  )
}

export function Save({
  label = 'Guardar',
  disabled = false,
}: any) {
  return (
    <div className="full right">
      <button
        className="btn primary"
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  )
}