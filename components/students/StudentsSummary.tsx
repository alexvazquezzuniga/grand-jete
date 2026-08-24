'use client'

import { useState } from 'react'
import Header from '@/components/common/Header'
import { money } from '@/lib/academy/format'
import type { Row } from '@/types/academy'

export default function StudentsSummary({
  students,
  enrollments,
  workshops,
  payments,
  editStudent,
}: any) {
  const [q, setQ] = useState('')
  const query = q.toLowerCase().trim()

  const rows = students
    .map((student: Row) => {
      const activeEnrollments = enrollments.filter(
        (e: Row) =>
          e.student_id === student.id &&
          e.status === 'active'
      )

      const workshopNames = activeEnrollments
        .map(
          (e: Row) =>
            workshops.find(
              (w: Row) => w.id === e.workshop_id
            )?.name
        )
        .filter(Boolean)

      const monthlyTotal = activeEnrollments.reduce(
        (sum: number, e: Row) =>
          sum +
          Math.max(
            0,
            Number(e.agreed_monthly_fee || 0) -
              Number(e.discount || 0)
          ),
        0
      )

      const studentPayments = payments
        .filter(
          (p: Row) => p.student_id === student.id
        )
        .sort((a: Row, b: Row) =>
          String(b.payment_date || '').localeCompare(
            String(a.payment_date || '')
          )
        )

      return {
        student,
        workshopNames,
        monthlyTotal,
        lastPayment: studentPayments[0] || null,
      }
    })
    .filter(
      (r: any) =>
        !query ||
        [
          r.student.full_name,
          r.student.phone,
          r.student.guardian_name,
          r.workshopNames.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
    )
    .sort((a: any, b: any) =>
      String(a.student.full_name || '').localeCompare(
        String(b.student.full_name || ''),
        'es'
      )
    )

  return (
    <>
      <Header
        title="Alumnos"
        sub="Resumen académico y financiero de cada alumno."
      />

      <div className="toolbar">
        <input
          placeholder="Buscar por nombre, teléfono, tutor o taller"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card">
        {rows.length ? (
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Talleres activos</th>
                <th>Mensualidad total</th>
                <th>Último pago</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r: any) => {
                const s = r.student
                const lp = r.lastPayment

                return (
                  <tr key={s.id}>
                    <td>
                      <b>{s.full_name}</b>
                      <div className="small">
                        {s.guardian_name
                          ? `Tutor: ${s.guardian_name}`
                          : s.phone || s.email || ''}
                      </div>
                    </td>

                    <td>
                      {r.workshopNames.length
                        ? r.workshopNames.join(' · ')
                        : '—'}
                    </td>

                    <td>
                      <b>{money(r.monthlyTotal)}</b>
                    </td>

                    <td>
                      {lp ? (
                        <>
                          <b>{money(lp.amount)}</b>
                          <div className="small">
                            {lp.payment_date || ''}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td>
                      <span
                        className={`pill ${
                          s.status === 'active'
                            ? 'ok'
                            : s.status === 'inactive'
                            ? 'bad'
                            : 'neutral'
                        }`}
                      >
                        {s.status === 'active'
                          ? 'Activo'
                          : s.status === 'inactive'
                          ? 'Inactivo'
                          : s.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="link"
                        onClick={() => editStudent(s)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            No hay alumnos que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </>
  )
}