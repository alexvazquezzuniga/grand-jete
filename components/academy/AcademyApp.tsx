'use client'

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { createClient } from '@/utils/supabase/client'

import {
  fetchAcademyData,
  saveRow as apiSaveRow,
  deleteRow as apiDeleteRow,
  saveWorkshop as apiSaveWorkshop,
  saveEnrollment as apiSaveEnrollment,
} from '@/lib/academy/api'

import { monthNow } from '@/lib/academy/format'
import type {
  ModalState,
  Row,
  Section,
} from '@/types/academy'

import Sidebar from '@/components/layout/Sidebar'
import LoginScreen from '@/components/auth/LoginScreen'
import Home from '@/components/dashboard/Home'
import StudentsSummary from '@/components/students/StudentsSummary'
import EnrollmentsView from '@/components/enrollments/EnrollmentsView'
import WorkshopsView from '@/components/workshops/WorkshopsView'
import TeachersView from '@/components/teachers/TeachersView'
import PaymentsView from '@/components/payments/PaymentsView'
import ExpensesView from '@/components/expenses/ExpensesView'
import FinanceView from '@/components/finance/FinanceView'
import EntryModal from '@/components/modals/EntryModal'

const supabase = createClient()

export default function AcademyApp() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Row | null>(null)

  const [section, setSection] =
    useState<Section>('inicio')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [students, setStudents] =
    useState<Row[]>([])

  const [teachers, setTeachers] =
    useState<Row[]>([])

  const [workshops, setWorkshops] =
    useState<Row[]>([])

  const [schedules, setSchedules] =
    useState<Row[]>([])

  const [enrollments, setEnrollments] =
    useState<Row[]>([])

  const [payments, setPayments] =
    useState<Row[]>([])

  const [expenses, setExpenses] =
    useState<Row[]>([])

  // NUEVO: catálogo de disciplinas
  const [disciplines, setDisciplines] =
    useState<Row[]>([])

  // NUEVO: relación maestros-disciplinas
  const [
    teacherDisciplines,
    setTeacherDisciplines,
  ] = useState<Row[]>([])

  const [modal, setModal] =
    useState<ModalState>(null)

  const [month, setMonth] =
    useState(monthNow())

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session)

        if (data.session) {
          await boot(data.session.user.id)
        } else {
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)

        if (newSession) {
          await boot(newSession.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function boot(userId: string) {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (
      !data ||
      data.active !== true ||
      data.role !== 'admin'
    ) {
      setError(
        'Esta cuenta no tiene permisos de administración.'
      )

      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    setProfile(data)

    await refreshAll()

    setLoading(false)
  }

  async function refreshAll() {
    try {
      const d = await fetchAcademyData(supabase)

      setStudents(d.students)
      setTeachers(d.teachers)
      setWorkshops(d.workshops)
      setSchedules(d.schedules)
      setEnrollments(d.enrollments)
      setPayments(d.payments)
      setExpenses(d.expenses)

      // Cargar catálogo de disciplinas
      const {
        data: disciplineRows,
        error: disciplinesError,
      } = await supabase
        .from('disciplines')
        .select('*')
        .eq('active', true)
        .order('name')

      if (disciplinesError) {
        throw disciplinesError
      }

      setDisciplines(disciplineRows || [])

      // Cargar relaciones maestro-disciplina
      const {
        data: relationRows,
        error: relationsError,
      } = await supabase
        .from('teacher_disciplines')
        .select('*')

      if (relationsError) {
        throw relationsError
      }

      setTeacherDisciplines(relationRows || [])
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function login(e: FormEvent) {
    e.preventDefault()

    setError('')
    setMessage('')

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setError(error.message)
    }
  }

  async function recover() {
    setError('')
    setMessage('')

    if (!email) {
      setError('Escribe primero tu correo.')
      return
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        'Te enviamos un correo para restablecer tu contraseña.'
      )
    }
  }

  async function logout() {
    await supabase.auth.signOut()

    setProfile(null)
    setSection('inicio')
  }

  function notify(m: string) {
    setMessage(m)

    setTimeout(
      () => setMessage(''),
      2200
    )
  }

  async function saveGeneric(
    table: string,
    payload: Row,
    id?: string
  ) {
    try {
      await apiSaveRow(
        supabase,
        table,
        payload,
        id
      )

      setModal(null)

      await refreshAll()

      notify('Guardado correctamente')
    } catch (e: any) {
      setError(e.message)
    }
  }

  // NUEVO: guardado especializado de maestros
  async function saveTeacher(
    payload: any,
    id?: string
  ) {
    try {
      setError('')

      const {
        primary_discipline_id,
        discipline_ids = [],
        ...teacherPayload
      } = payload

      let selectedIds: string[] =
        Array.isArray(discipline_ids)
          ? discipline_ids
          : []

      // La disciplina principal siempre debe estar incluida
      if (
        primary_discipline_id &&
        !selectedIds.includes(
          primary_discipline_id
        )
      ) {
        selectedIds = [
          primary_discipline_id,
          ...selectedIds,
        ]
      }

      // Quitar duplicados
      selectedIds = [
        ...new Set(selectedIds),
      ]

      const selectedDisciplines =
        selectedIds
          .map((disciplineId) =>
            disciplines.find(
              (d) => d.id === disciplineId
            )
          )
          .filter(Boolean)

      // Ordenar principal primero
      const orderedDisciplines = [
        ...selectedDisciplines.filter(
          (d: any) =>
            d.id === primary_discipline_id
        ),

        ...selectedDisciplines.filter(
          (d: any) =>
            d.id !== primary_discipline_id
        ),
      ]

      // Mantener main_discipline para compatibilidad
      teacherPayload.main_discipline =
        orderedDisciplines
          .map((d: any) => d.name)
          .join(', ')

      let teacherId = id

      if (id) {
        const { error } = await supabase
          .from('teachers')
          .update(teacherPayload)
          .eq('id', id)

        if (error) {
          throw error
        }
      } else {
        const {
          data,
          error,
        } = await supabase
          .from('teachers')
          .insert(teacherPayload)
          .select('id')
          .single()

        if (error) {
          throw error
        }

        teacherId = data.id
      }

      if (!teacherId) {
        throw new Error(
          'No se pudo identificar al maestro.'
        )
      }

      // Rehacer relaciones del maestro
      const { error: deleteError } =
        await supabase
          .from('teacher_disciplines')
          .delete()
          .eq('teacher_id', teacherId)

      if (deleteError) {
        throw deleteError
      }

      if (selectedIds.length) {
        const rows = selectedIds.map(
          (disciplineId) => ({
            teacher_id: teacherId,
            discipline_id:
              disciplineId,
            is_primary:
              disciplineId ===
              primary_discipline_id,
          })
        )

        const { error: insertError } =
          await supabase
            .from('teacher_disciplines')
            .insert(rows)

        if (insertError) {
          throw insertError
        }
      }

      setModal(null)

      await refreshAll()

      notify(
        'Maestro y disciplinas guardados correctamente'
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function saveWorkshop(
    payload: Row,
    scheduleRows: Row[],
    id?: string
  ) {
    try {
      await apiSaveWorkshop(
        supabase,
        payload,
        scheduleRows,
        id
      )

      setModal(null)

      await refreshAll()

      notify(
        'Taller y horarios guardados correctamente'
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function saveEnrollment(
    data: Row
  ) {
    try {
      await apiSaveEnrollment(
        supabase,
        data,
        workshops,
        enrollments
      )

      setModal(null)

      await refreshAll()

      notify(
        data.mode === 'new'
          ? 'Alumno e inscripción creados correctamente'
          : 'Inscripción creada correctamente'
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function remove(
    table: string,
    id: string
  ) {
    if (
      !confirm(
        '¿Eliminar este registro?'
      )
    ) {
      return
    }

    try {
      await apiDeleteRow(
        supabase,
        table,
        id
      )

      await refreshAll()

      notify('Registro eliminado')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const monthPayments =
    useMemo(
      () =>
        payments.filter((p) =>
          (
            p.payment_date || ''
          ).startsWith(month)
        ),
      [payments, month]
    )

  const monthExpenses =
    useMemo(
      () =>
        expenses.filter((x) =>
          (
            x.expense_date || ''
          ).startsWith(month)
        ),
      [expenses, month]
    )

  const income =
    monthPayments.reduce(
      (s, p) =>
        s + Number(p.amount || 0),
      0
    )

  const out =
    monthExpenses.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  if (loading) {
    return (
      <div className="loading">
        Cargando Grand Jeté…
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <LoginScreen
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        error={error}
        message={message}
        onLogin={login}
        onRecover={recover}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar
        section={section}
        setSection={setSection}
        profile={profile}
        logout={logout}
      />

      <main className="main">
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {message && (
          <div className="success">
            {message}
          </div>
        )}

        {section === 'inicio' && (
          <Home
            students={students}
            teachers={teachers}
            workshops={workshops}
            payments={monthPayments}
            income={income}
            out={out}
            setSection={setSection}
          />
        )}

        {section === 'alumnos' && (
          <StudentsSummary
            students={students}
            enrollments={enrollments}
            workshops={workshops}
            payments={payments}
            editStudent={(r: Row) =>
              setModal({
                type: 'student',
                row: r,
              })
            }
          />
        )}

        {section ===
          'inscripciones' && (
          <EnrollmentsView
            rows={enrollments}
            students={students}
            workshops={workshops}
            add={() =>
              setModal({
                type: 'enrollment',
              })
            }
            editStudent={(r: Row) =>
              setModal({
                type: 'student',
                row: r,
              })
            }
            remove={(id: string) =>
              remove(
                'enrollments',
                id
              )
            }
          />
        )}

        {section === 'talleres' && (
          <WorkshopsView
            rows={workshops}
            teachers={teachers}
            enrollments={enrollments}
            schedules={schedules}
            edit={(r: Row) =>
              setModal({
                type: 'workshop',
                row: r,
              })
            }
            add={() =>
              setModal({
                type: 'workshop',
              })
            }
            remove={(id: string) =>
              remove(
                'workshops',
                id
              )
            }
          />
        )}

        {section === 'maestros' && (
          <TeachersView
            rows={teachers}
            edit={(r: Row) =>
              setModal({
                type: 'teacher',
                row: r,
              })
            }
            add={() =>
              setModal({
                type: 'teacher',
              })
            }
            remove={(id: string) =>
              remove(
                'teachers',
                id
              )
            }
          />
        )}

        {section === 'pagos' && (
          <PaymentsView
            rows={payments}
            students={students}
            add={() =>
              setModal({
                type: 'payment',
              })
            }
            remove={(id: string) =>
              remove(
                'payments',
                id
              )
            }
          />
        )}

        {section === 'gastos' && (
          <ExpensesView
            rows={expenses}
            add={() =>
              setModal({
                type: 'expense',
              })
            }
            remove={(id: string) =>
              remove(
                'expenses',
                id
              )
            }
          />
        )}

        {section === 'finanzas' && (
          <FinanceView
            month={month}
            setMonth={setMonth}
            payments={monthPayments}
            expenses={monthExpenses}
            income={income}
            out={out}
            teachers={teachers}
          />
        )}
      </main>

      {modal && (
        <EntryModal
          modal={modal}
          close={() =>
            setModal(null)
          }
          saveGeneric={saveGeneric}
          saveTeacher={saveTeacher}
          saveWorkshop={saveWorkshop}
          saveEnrollment={saveEnrollment}
          profile={profile}
          students={students}
          teachers={teachers}
          workshops={workshops}
          schedules={schedules}
          disciplines={disciplines}
          teacherDisciplines={
            teacherDisciplines
          }
        />
      )}
    </div>
  )
}