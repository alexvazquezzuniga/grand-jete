'use client'

import StudentForm from '@/components/students/StudentForm'
import TeacherForm from '@/components/teachers/TeacherForm'
import WorkshopForm from '@/components/workshops/WorkshopForm'
import EnrollmentForm from '@/components/enrollments/EnrollmentForm'
import PaymentForm from '@/components/payments/PaymentForm'
import ExpenseForm from '@/components/expenses/ExpenseForm'

export default function EntryModal({
  modal,
  close,
  saveGeneric,
  saveTeacher,
  saveWorkshop,
  saveEnrollment,
  profile,
  students,
  teachers,
  workshops,
  schedules,
  disciplines,
  teacherDisciplines,
}: any) {
  const row = modal.row || {}

  let title = ''
  let body: any = null

  if (modal.type === 'student') {
    title = row.id
      ? 'Editar alumno'
      : 'Nuevo alumno'

    body = (
      <StudentForm
        row={row}
        onSave={(
          payload: any,
          id?: string
        ) =>
          saveGeneric(
            'students',
            payload,
            id
          )
        }
      />
    )
  }

  if (modal.type === 'teacher') {
    title = row.id
      ? 'Editar maestro'
      : 'Nuevo maestro'

    body = (
      <TeacherForm
        row={row}
        disciplines={disciplines}
        teacherDisciplines={
          teacherDisciplines
        }
        onSave={saveTeacher}
      />
    )
  }

  if (modal.type === 'workshop') {
    title = row.id
      ? 'Editar taller'
      : 'Nuevo taller'

    body = (
      <WorkshopForm
        row={row}
        teachers={teachers}
        schedules={schedules}
        onSave={saveWorkshop}
      />
    )
  }

  if (modal.type === 'enrollment') {
    title = 'Nueva inscripción'

    body = (
      <EnrollmentForm
        students={students}
        workshops={workshops}
        onSave={saveEnrollment}
      />
    )
  }

  if (modal.type === 'payment') {
    title = 'Registrar pago'

    body = (
      <PaymentForm
        students={students}
        profile={profile}
        onSave={(payload: any) =>
          saveGeneric(
            'payments',
            payload
          )
        }
      />
    )
  }

  if (modal.type === 'expense') {
    title = 'Registrar gasto'

    body = (
      <ExpenseForm
        profile={profile}
        onSave={(payload: any) =>
          saveGeneric(
            'expenses',
            payload
          )
        }
      />
    )
  }

  return (
    <div
      className="modal"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          close()
        }
      }}
    >
      <div className="dialog">
        <div className="dialogHead">
          <h2>{title}</h2>

          <button
            className="close"
            onClick={close}
          >
            ×
          </button>
        </div>

        {body}
      </div>
    </div>
  )
}