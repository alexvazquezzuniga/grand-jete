'use client'

import type {
  FormEvent,
} from 'react'

import {
  F,
  Sel,
  TA,
  Save,
} from '@/components/common/FormFields'

export default function TeacherForm({
  row = {},
  disciplines = [],
  teacherDisciplines = [],
  onSave,
}: any) {
  const currentRelations =
    row.id
      ? teacherDisciplines.filter(
          (r: any) =>
            r.teacher_id === row.id
        )
      : []

  const primaryRelation =
    currentRelations.find(
      (r: any) =>
        r.is_primary === true
    )

  const currentIds =
    currentRelations.map(
      (r: any) =>
        r.discipline_id
    )

  function submit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    const fd =
      new FormData(e.currentTarget)

    const payload: any =
      Object.fromEntries(fd)

    payload.discipline_ids =
      fd.getAll(
        'discipline_ids'
      )

    payload.primary_discipline_id =
      fd.get(
        'primary_discipline_id'
      )

    onSave(
      payload,
      row.id
    )
  }

  return (
    <form onSubmit={submit}>
      <div className="formGrid">
        <F
          name="full_name"
          label="Nombre completo *"
          value={row.full_name}
          required
        />

        <F
          name="phone"
          label="Teléfono"
          value={row.phone}
        />

        <F
          name="email"
          label="Correo"
          type="email"
          value={row.email}
        />

        <div className="field">
          <label>
            Disciplina principal
          </label>

          <select
            name="primary_discipline_id"
            defaultValue={
              primaryRelation
                ?.discipline_id ||
              ''
            }
          >
            <option value="">
              Sin asignar
            </option>

            {disciplines.map(
              (d: any) => (
                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.name}
                </option>
              )
            )}
          </select>
        </div>

 <div className="field full">
  <label>
    Disciplinas que puede impartir
  </label>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '10px 18px',
      marginTop: 8,
      padding: 14,
      border: '1px solid #e4ddd3',
      borderRadius: 10,
      background: '#faf8f5',
    }}
  >
    {disciplines.map((d: any) => (
      <div
        key={d.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
        }}
      >
        <input
          id={`discipline-${d.id}`}
          type="checkbox"
          name="discipline_ids"
          value={d.id}
          defaultChecked={currentIds.includes(d.id)}
          style={{
            width: 16,
            height: 16,
            margin: 0,
            flex: '0 0 auto',
          }}
        />

        <label
          htmlFor={`discipline-${d.id}`}
          style={{
            margin: 0,
            display: 'inline',
            width: 'auto',
            cursor: 'pointer',
            whiteSpace: 'normal',
          }}
        >
          {d.name}
        </label>
      </div>
    ))}
  </div>
</div>

        <Sel
          name="payment_scheme"
          label="Esquema de pago"
          value={
            row.payment_scheme ||
            'monthly'
          }
          options={[
            'monthly',
            'biweekly',
            'weekly',
            'per_hour',
          ]}
        />

        <F
          name="base_pay"
          label="Importe / nómina base"
          type="number"
          value={
            row.base_pay || 0
          }
        />

        <Sel
          name="status"
          label="Estado"
          value={
            row.status ||
            'active'
          }
          options={[
            'active',
            'inactive',
          ]}
        />

        <TA
          name="notes"
          label="Notas"
          value={row.notes}
        />

        <Save />
      </div>
    </form>
  )
}