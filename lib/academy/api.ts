import type { SupabaseClient } from '@supabase/supabase-js'
import type { Row } from '@/types/academy'

export async function fetchAcademyData(supabase:SupabaseClient){
  const [students,teachers,workshops,schedules,enrollments,payments,expenses]=await Promise.all([
    supabase.from('students').select('*').order('full_name'),
    supabase.from('teachers').select('*').order('full_name'),
    supabase.from('workshops').select('*').order('name'),
    supabase.from('workshop_schedules').select('*').order('day_of_week').order('start_time'),
    supabase.from('enrollments').select('*').order('created_at',{ascending:false}),
    supabase.from('payments').select('*').order('payment_date',{ascending:false}),
    supabase.from('expenses').select('*').order('expense_date',{ascending:false}),
  ])
  const result=[students,teachers,workshops,schedules,enrollments,payments,expenses]
  const error=result.find(r=>r.error)?.error
  if(error)throw error
  return {
    students:students.data||[], teachers:teachers.data||[], workshops:workshops.data||[],
    schedules:schedules.data||[], enrollments:enrollments.data||[], payments:payments.data||[], expenses:expenses.data||[]
  }
}

export async function saveRow(supabase:SupabaseClient,table:string,payload:Row,id?:string){
  const query=id?supabase.from(table).update(payload).eq('id',id):supabase.from(table).insert(payload)
  const {error}=await query
  if(error)throw error
}

export async function deleteRow(supabase:SupabaseClient,table:string,id:string){
  const {error}=await supabase.from(table).delete().eq('id',id)
  if(error)throw error
}

export async function saveWorkshop(supabase:SupabaseClient,payload:Row,schedules:Row[],id?:string){
  let workshopId=id
  if(id){
    const {error}=await supabase.from('workshops').update(payload).eq('id',id)
    if(error)throw error
  }else{
    const {data,error}=await supabase.from('workshops').insert(payload).select('id').single()
    if(error)throw error
    workshopId=data.id
  }
  if(!workshopId)throw new Error('No fue posible identificar el taller.')
  const {error:deleteError}=await supabase.from('workshop_schedules').delete().eq('workshop_id',workshopId)
  if(deleteError)throw deleteError
  if(schedules.length){
    const rows=schedules.map(s=>({workshop_id:workshopId,day_of_week:Number(s.day_of_week),start_time:s.start_time,end_time:s.end_time,classroom:payload.classroom||null}))
    const {error}=await supabase.from('workshop_schedules').insert(rows)
    if(error)throw error
  }
}

export async function saveEnrollment(supabase:SupabaseClient,data:Row,workshops:Row[],enrollments:Row[]){
  const workshop=workshops.find(w=>w.id===data.workshop_id)
  if(!workshop)throw new Error('Selecciona un taller válido.')
  const officialFee=Number(workshop.monthly_fee||0)
  const discount=Number(data.discount||0)
  if(discount<0)throw new Error('El descuento no puede ser negativo.')
  if(discount>officialFee)throw new Error('El descuento no puede ser mayor que la mensualidad del taller.')

  let studentId=String(data.student_id||'')
  let createdStudentId:string|null=null
  if(data.mode==='new'){
    const studentPayload={
      full_name:String(data.full_name||'').trim(), birth_date:data.birth_date||null,
      phone:String(data.phone||'').trim()||null, email:String(data.email||'').trim()||null,
      guardian_name:String(data.guardian_name||'').trim()||null, guardian_phone:String(data.guardian_phone||'').trim()||null,
      emergency_contact:String(data.emergency_contact||'').trim()||null, emergency_phone:String(data.emergency_phone||'').trim()||null,
      enrollment_date:data.start_date||new Date().toISOString().slice(0,10), status:'active', notes:String(data.student_notes||'').trim()||null,
    }
    if(!studentPayload.full_name)throw new Error('Escribe el nombre del alumno.')
    const {data:newStudent,error}=await supabase.from('students').insert(studentPayload).select('id').single()
    if(error)throw error
    studentId=newStudent.id; createdStudentId=newStudent.id
  }
  if(!studentId)throw new Error('Selecciona un alumno existente o registra uno nuevo.')
  const duplicate=enrollments.some(e=>e.student_id===studentId&&e.workshop_id===data.workshop_id&&e.status==='active')
  if(duplicate){
    if(createdStudentId)await supabase.from('students').delete().eq('id',createdStudentId)
    throw new Error('Este alumno ya tiene una inscripción activa en ese taller.')
  }
  const {error}=await supabase.from('enrollments').insert({
    student_id:studentId, workshop_id:data.workshop_id, start_date:data.start_date,
    agreed_monthly_fee:officialFee, discount, status:data.status||'active', notes:String(data.notes||'').trim()||null,
  })
  if(error){
    if(createdStudentId)await supabase.from('students').delete().eq('id',createdStudentId)
    throw error
  }
}
