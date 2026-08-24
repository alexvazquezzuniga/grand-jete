'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Row = Record<string, any>
type Section = 'inicio'|'alumnos'|'maestros'|'talleres'|'inscripciones'|'pagos'|'gastos'|'finanzas'

const money=(n:any)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n||0))
const today=()=>new Date().toISOString().slice(0,10)
const monthNow=()=>new Date().toISOString().slice(0,7)

export default function Page(){
  const [loading,setLoading]=useState(true)
  const [session,setSession]=useState<any>(null)
  const [profile,setProfile]=useState<Row|null>(null)
  const [section,setSection]=useState<Section>('inicio')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [students,setStudents]=useState<Row[]>([])
  const [teachers,setTeachers]=useState<Row[]>([])
  const [workshops,setWorkshops]=useState<Row[]>([])
  const [enrollments,setEnrollments]=useState<Row[]>([])
  const [payments,setPayments]=useState<Row[]>([])
  const [expenses,setExpenses]=useState<Row[]>([])
  const [modal,setModal]=useState<{type:string,row?:Row}|null>(null)
  const [query,setQuery]=useState('')
  const [month,setMonth]=useState(monthNow())

  useEffect(()=>{
    supabase.auth.getSession().then(async({data})=>{ setSession(data.session); if(data.session) await boot(data.session.user.id); setLoading(false) })
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(_e,s)=>{setSession(s);if(s)await boot(s.user.id);else setProfile(null)})
    return()=>subscription.unsubscribe()
  },[])

  async function boot(uid:string){
    setError('')
    const {data:p,error:pe}=await supabase.from('profiles').select('*').eq('id',uid).single()
    if(pe||!p){setError('Tu usuario no tiene perfil autorizado.');return}
    if(p.role!=='admin'||p.active!==true){setError('Tu usuario no tiene permisos de administrador.');return}
    setProfile(p)
    await refreshAll()
  }

  async function refreshAll(){
    const [s,t,w,e,p,x]=await Promise.all([
      supabase.from('students').select('*').order('full_name'),
      supabase.from('teachers').select('*').order('full_name'),
      supabase.from('workshops').select('*').order('name'),
      supabase.from('enrollments').select('*').order('created_at',{ascending:false}),
      supabase.from('payments').select('*').order('payment_date',{ascending:false}),
      supabase.from('expenses').select('*').order('expense_date',{ascending:false})
    ])
    const err=[s,t,w,e,p,x].find(r=>r.error)?.error
    if(err){setError(err.message);return}
    setStudents(s.data||[]);setTeachers(t.data||[]);setWorkshops(w.data||[]);setEnrollments(e.data||[]);setPayments(p.data||[]);setExpenses(x.data||[])
  }

  async function login(ev:FormEvent){ev.preventDefault();setError('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}
  async function logout(){await supabase.auth.signOut();setProfile(null);setSection('inicio')}
  function notify(msg:string){setMessage(msg);setTimeout(()=>setMessage(''),2200)}

  async function saveRow(table:string,payload:Row,id?:string){
    setError('')
    const q=id?supabase.from(table).update(payload).eq('id',id):supabase.from(table).insert(payload)
    const {error}=await q
    if(error){setError(error.message);return false}
    setModal(null);await refreshAll();notify('Guardado correctamente');return true
  }
  async function removeRow(table:string,id:string){if(!confirm('¿Eliminar este registro?'))return;const {error}=await supabase.from(table).delete().eq('id',id);if(error)setError(error.message);else{await refreshAll();notify('Registro eliminado')}}

  const monthlyPayments=useMemo(()=>payments.filter(p=>(p.payment_date||'').startsWith(month)),[payments,month])
  const monthlyExpenses=useMemo(()=>expenses.filter(x=>(x.expense_date||'').startsWith(month)),[expenses,month])
  const income=monthlyPayments.reduce((s,p)=>s+Number(p.amount||0),0)
  const out=monthlyExpenses.reduce((s,p)=>s+Number(p.amount||0),0)

  if(loading)return <div className="loginWrap"><div className="loginCard">Cargando…</div></div>
  if(!session||!profile)return <div className="loginWrap"><form className="loginCard" onSubmit={login}><img src="/grand-jete-logo.png" className="loginLogo" alt="Grand Jeté"/><h1 style={{textAlign:'center',fontSize:22}}>Administración</h1><p className="sub" style={{textAlign:'center',marginBottom:22}}>Ingresa con tu cuenta autorizada.</p>{error&&<div className="error">{error}</div>}<div className="field"><label>Correo</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div><button className="btn primary" style={{width:'100%'}}>Entrar</button></form></div>

  const nav:[Section,string][]=[['inicio','Inicio'],['alumnos','Alumnos'],['talleres','Talleres'],['maestros','Maestros'],['inscripciones','Inscripciones'],['pagos','Pagos'],['gastos','Gastos'],['finanzas','Finanzas']]
  return <div className="app"><aside className="sidebar"><div className="sidebarInner"><div className="brand"><img src="/grand-jete-logo.png" alt="Grand Jeté"/></div><div className="nav">{nav.map(([k,l])=><button key={k} className={section===k?'active':''} onClick={()=>setSection(k)}>{l}</button>)}</div><div className="userBox"><b>{profile.full_name}</b><br/>Administrador<br/><button className="link" style={{marginTop:8}} onClick={logout}>Cerrar sesión</button></div></div></aside><main className="main">{error&&<div className="error">{error}</div>}{message&&<div className="success">{message}</div>}{section==='inicio'&&<Home students={students} teachers={teachers} workshops={workshops} payments={payments} income={income} out={out} setSection={setSection}/>} {section==='alumnos'&&<Students rows={students} query={query} setQuery={setQuery} edit={r=>setModal({type:'student',row:r})} add={()=>setModal({type:'student'})} remove={id=>removeRow('students',id)}/>} {section==='maestros'&&<Teachers rows={teachers} edit={r=>setModal({type:'teacher',row:r})} add={()=>setModal({type:'teacher'})} remove={id=>removeRow('teachers',id)}/>} {section==='talleres'&&<Workshops rows={workshops} teachers={teachers} enrollments={enrollments} edit={r=>setModal({type:'workshop',row:r})} add={()=>setModal({type:'workshop'})} remove={id=>removeRow('workshops',id)}/>} {section==='inscripciones'&&<Enrollments rows={enrollments} students={students} workshops={workshops} add={()=>setModal({type:'enrollment'})} remove={id=>removeRow('enrollments',id)}/>} {section==='pagos'&&<Payments rows={payments} students={students} add={()=>setModal({type:'payment'})} remove={id=>removeRow('payments',id)}/>} {section==='gastos'&&<Expenses rows={expenses} add={()=>setModal({type:'expense'})} remove={id=>removeRow('expenses',id)}/>} {section==='finanzas'&&<Finance month={month} setMonth={setMonth} payments={monthlyPayments} expenses={monthlyExpenses} income={income} out={out} teachers={teachers}/>} </main>{modal&&<EntryModal modal={modal} close={()=>setModal(null)} save={saveRow} profile={profile} students={students} teachers={teachers} workshops={workshops}/>}</div>
}

function Header({title,sub,action,label}:{title:string,sub:string,action?:()=>void,label?:string}){return <div className="top"><div><h1>{title}</h1><div className="sub">{sub}</div></div>{action&&<button className="btn primary" onClick={action}>+ {label}</button>}</div>}
function Home({students,teachers,workshops,payments,income,out,setSection}:any){return <><Header title={`Buenas tardes`} sub="Así está funcionando Grand Jeté."/><div className="grid4"><Metric label="Alumnos activos" value={students.filter((x:Row)=>x.status==='active').length} note="Registrados actualmente"/><Metric label="Maestros activos" value={teachers.filter((x:Row)=>x.status==='active').length} note="Equipo docente"/><Metric label="Talleres activos" value={workshops.filter((x:Row)=>x.status==='active').length} note="Oferta vigente"/><Metric label="Ingresos del mes" value={money(income)} note={`Balance ${money(income-out)}`}/></div><div className="grid2" style={{marginTop:14}}><div className="card"><div className="sectionTitle"><h2>Pagos recientes</h2><button className="link" onClick={()=>setSection('pagos')}>Ver todos</button></div>{payments.length?<table><tbody>{payments.slice(0,5).map((p:Row)=><tr key={p.id}><td>{p.concept}</td><td className="right"><b>{money(p.amount)}</b></td></tr>)}</tbody></table>:<div className="empty">Sin pagos todavía.</div>}</div><div className="card"><div className="sectionTitle"><h2>Estado del sistema</h2></div><div className="empty">Base central conectada a Supabase.<br/>Los datos ya son compartidos entre administradores.</div></div></div></>}
function Metric({label,value,note}:any){return <div className="card metric"><div className="label">{label}</div><div className="value">{value}</div><div className="note">{note}</div></div>}
function Students({rows,query,setQuery,edit,add,remove}:any){const q=query.toLowerCase();const filtered=rows.filter((r:Row)=>[r.full_name,r.phone,r.guardian_name].join(' ').toLowerCase().includes(q));return <><Header title="Alumnos" sub="Expediente general de estudiantes." action={add} label="Nuevo alumno"/><div className="toolbar"><input placeholder="Buscar por nombre, teléfono o tutor" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="card">{filtered.length?<table><thead><tr><th>Nombre</th><th>Contacto</th><th>Tutor</th><th>Estado</th><th></th></tr></thead><tbody>{filtered.map((r:Row)=><tr key={r.id}><td><b>{r.full_name}</b><div className="small">{r.email||''}</div></td><td>{r.phone||'—'}</td><td>{r.guardian_name||'—'}</td><td><span className={`pill ${r.status==='active'?'ok':r.status==='inactive'?'bad':'neutral'}`}>{r.status}</span></td><td><button className="link" onClick={()=>edit(r)}>Editar</button> · <button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>)}</tbody></table>:<div className="empty">Todavía no hay alumnos registrados.</div>}</div></>}
function Teachers({rows,edit,add,remove}:any){return <><Header title="Maestros" sub="Equipo docente y esquema de pago." action={add} label="Nuevo maestro"/><div className="card">{rows.length?<table><thead><tr><th>Maestro</th><th>Disciplina</th><th>Esquema</th><th>Base</th><th>Estado</th><th></th></tr></thead><tbody>{rows.map((r:Row)=><tr key={r.id}><td><b>{r.full_name}</b><div className="small">{r.phone||''}</div></td><td>{r.main_discipline||'—'}</td><td>{r.payment_scheme}</td><td>{money(r.base_pay)}</td><td><span className={`pill ${r.status==='active'?'ok':'bad'}`}>{r.status}</span></td><td><button className="link" onClick={()=>edit(r)}>Editar</button> · <button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>)}</tbody></table>:<div className="empty">Todavía no hay maestros registrados.</div>}</div></>}
function Workshops({rows,teachers,enrollments,edit,add,remove}:any){return <><Header title="Talleres" sub="Disciplina, mensualidad, cupo y horario." action={add} label="Nuevo taller"/><div className="card">{rows.length?<table><thead><tr><th>Taller</th><th>Maestro</th><th>Horario</th><th>Alumnos</th><th>Mensualidad</th><th></th></tr></thead><tbody>{rows.map((r:Row)=>{const t=teachers.find((x:Row)=>x.id===r.teacher_id);const n=enrollments.filter((x:Row)=>x.workshop_id===r.id&&x.status==='active').length;return <tr key={r.id}><td><b>{r.name}</b><div className="small">{r.level||r.discipline||''}</div></td><td>{t?.full_name||'—'}</td><td>{r.schedule||'—'}</td><td>{n} / {r.capacity||'—'}</td><td>{money(r.monthly_fee)}</td><td><button className="link" onClick={()=>edit(r)}>Editar</button> · <button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>})}</tbody></table>:<div className="empty">Todavía no hay talleres registrados.</div>}</div></>}
function Enrollments({rows,students,workshops,add,remove}:any){return <><Header title="Inscripciones" sub="Relaciona alumnos con talleres conservando historial." action={add} label="Nueva inscripción"/><div className="card">{rows.length?<table><thead><tr><th>Alumno</th><th>Taller</th><th>Inicio</th><th>Mensualidad</th><th>Estado</th><th></th></tr></thead><tbody>{rows.map((r:Row)=>{const s=students.find((x:Row)=>x.id===r.student_id),w=workshops.find((x:Row)=>x.id===r.workshop_id);return <tr key={r.id}><td>{s?.full_name||'—'}</td><td>{w?.name||'—'}</td><td>{r.start_date}</td><td>{money(Number(r.agreed_monthly_fee)-Number(r.discount||0))}</td><td><span className={`pill ${r.status==='active'?'ok':'neutral'}`}>{r.status}</span></td><td><button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>})}</tbody></table>:<div className="empty">Todavía no hay inscripciones registradas.</div>}</div></>}
function Payments({rows,students,add,remove}:any){return <><Header title="Pagos" sub="Mensualidades, inscripción y otros conceptos." action={add} label="Registrar pago"/><div className="card">{rows.length?<table><thead><tr><th>Fecha</th><th>Alumno</th><th>Concepto</th><th>Método</th><th>Importe</th><th></th></tr></thead><tbody>{rows.map((r:Row)=>{const s=students.find((x:Row)=>x.id===r.student_id);return <tr key={r.id}><td>{r.payment_date}</td><td>{s?.full_name||'—'}</td><td>{r.concept}</td><td>{r.payment_method}</td><td><b>{money(r.amount)}</b></td><td><button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>})}</tbody></table>:<div className="empty">Todavía no hay pagos registrados.</div>}</div></>}
function Expenses({rows,add,remove}:any){return <><Header title="Gastos" sub="Nómina, renta, servicios y otros egresos." action={add} label="Registrar gasto"/><div className="card">{rows.length?<table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Importe</th><th></th></tr></thead><tbody>{rows.map((r:Row)=><tr key={r.id}><td>{r.expense_date}</td><td>{r.category}</td><td>{r.description||'—'}</td><td><b>{money(r.amount)}</b></td><td><button className="link" onClick={()=>remove(r.id)}>Eliminar</button></td></tr>)}</tbody></table>:<div className="empty">Todavía no hay gastos registrados.</div>}</div></>}
function Finance({month,setMonth,payments,expenses,income,out,teachers}:any){const payroll=teachers.filter((t:Row)=>t.status==='active').reduce((s:number,t:Row)=>s+Number(t.base_pay||0),0);return <><div className="top"><div><h1>Finanzas</h1><div className="sub">Balance del mes seleccionado.</div></div><input type="month" style={{width:180}} value={month} onChange={e=>setMonth(e.target.value)}/></div><div className="grid4"><Metric label="Ingresos" value={money(income)} note="Cobrado en el mes"/><Metric label="Egresos" value={money(out)} note="Registrado en el mes"/><Metric label="Resultado" value={money(income-out)} note="Ingresos menos egresos"/><Metric label="Nómina teórica" value={money(payroll)} note="Suma de base activa"/></div><div className="grid2" style={{marginTop:14}}><div className="card"><h2 style={{fontSize:16}}>Ingresos del mes</h2>{payments.length?<table><tbody>{payments.map((r:Row)=><tr key={r.id}><td>{r.concept}</td><td className="right"><b>{money(r.amount)}</b></td></tr>)}</tbody></table>:<div className="empty">Sin ingresos.</div>}</div><div className="card"><h2 style={{fontSize:16}}>Egresos del mes</h2>{expenses.length?<table><tbody>{expenses.map((r:Row)=><tr key={r.id}><td>{r.category}</td><td className="right"><b>{money(r.amount)}</b></td></tr>)}</tbody></table>:<div className="empty">Sin egresos.</div>}</div></div></>}

function EntryModal({modal,close,save,profile,students,teachers,workshops}:any){
  const r=modal.row||{}
  const submit=(table:string,transform?:(o:Row)=>Row)=>(ev:FormEvent<HTMLFormElement>)=>{ev.preventDefault();let o=Object.fromEntries(new FormData(ev.currentTarget) as any);if(transform)o=transform(o);save(table,o,r.id)}
  let body:any=null,title=''
  if(modal.type==='student'){title=r.id?'Editar alumno':'Nuevo alumno';body=<form onSubmit={submit('students')}><div className="formGrid"><F name="full_name" label="Nombre completo *" value={r.full_name} required/><F name="birth_date" label="Fecha de nacimiento" type="date" value={r.birth_date}/><F name="phone" label="Teléfono" value={r.phone}/><F name="email" label="Correo" type="email" value={r.email}/><F name="guardian_name" label="Tutor / responsable" value={r.guardian_name}/><F name="guardian_phone" label="Teléfono tutor" value={r.guardian_phone}/><F name="emergency_contact" label="Contacto de emergencia" value={r.emergency_contact}/><F name="emergency_phone" label="Teléfono emergencia" value={r.emergency_phone}/><F name="enrollment_date" label="Fecha de ingreso" type="date" value={r.enrollment_date||today()}/><Sel name="status" label="Estado" value={r.status||'active'} options={['active','paused','inactive']}/><TA name="notes" label="Notas" value={r.notes}/><Save/></div></form>}
  if(modal.type==='teacher'){title=r.id?'Editar maestro':'Nuevo maestro';body=<form onSubmit={submit('teachers')}><div className="formGrid"><F name="full_name" label="Nombre completo *" value={r.full_name} required/><F name="phone" label="Teléfono" value={r.phone}/><F name="email" label="Correo" type="email" value={r.email}/><F name="main_discipline" label="Disciplina principal" value={r.main_discipline}/><Sel name="payment_scheme" label="Esquema de pago" value={r.payment_scheme||'monthly'} options={['monthly','per_class','per_hour','per_student','percentage']}/><F name="base_pay" label="Importe / nómina base" type="number" value={r.base_pay||0}/><Sel name="status" label="Estado" value={r.status||'active'} options={['active','inactive']}/><TA name="notes" label="Notas" value={r.notes}/><Save/></div></form>}
  if(modal.type==='workshop'){title=r.id?'Editar taller':'Nuevo taller';body=<form onSubmit={submit('workshops',o=>({...o,teacher_id:o.teacher_id||null,capacity:o.capacity?Number(o.capacity):null,monthly_fee:Number(o.monthly_fee||0)}))}><div className="formGrid"><F name="name" label="Nombre del taller *" value={r.name} required/><F name="discipline" label="Disciplina" value={r.discipline}/><F name="level" label="Nivel" value={r.level}/><div className="field"><label>Maestro</label><select name="teacher_id" defaultValue={r.teacher_id||''}><option value="">Sin asignar</option>{teachers.map((t:Row)=><option key={t.id} value={t.id}>{t.full_name}</option>)}</select></div><F name="schedule" label="Horario" value={r.schedule}/><F name="classroom" label="Salón" value={r.classroom}/><F name="capacity" label="Cupo" type="number" value={r.capacity||20}/><F name="monthly_fee" label="Mensualidad" type="number" value={r.monthly_fee||0}/><Sel name="status" label="Estado" value={r.status||'active'} options={['active','closed']}/><TA name="notes" label="Notas" value={r.notes}/><Save/></div></form>}
  if(modal.type==='enrollment'){title='Nueva inscripción';body=<form onSubmit={submit('enrollments',o=>{const w=workshops.find((x:Row)=>x.id===o.workshop_id);return {...o,agreed_monthly_fee:Number(o.agreed_monthly_fee||w?.monthly_fee||0),discount:Number(o.discount||0)}})}><div className="formGrid"><div className="field"><label>Alumno *</label><select name="student_id" required><option value="">Seleccionar…</option>{students.filter((s:Row)=>s.status!=='inactive').map((s:Row)=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><div className="field"><label>Taller *</label><select name="workshop_id" required><option value="">Seleccionar…</option>{workshops.filter((w:Row)=>w.status==='active').map((w:Row)=><option key={w.id} value={w.id}>{w.name}</option>)}</select></div><F name="start_date" label="Fecha de inicio" type="date" value={today()}/><F name="agreed_monthly_fee" label="Mensualidad acordada" type="number" value=""/><F name="discount" label="Descuento / beca" type="number" value="0"/><Sel name="status" label="Estado" value="active" options={['active','paused','inactive']}/><TA name="notes" label="Notas"/><Save/></div></form>}
  if(modal.type==='payment'){title='Registrar pago';body=<form onSubmit={submit('payments',o=>({...o,amount:Number(o.amount),registered_by:profile.id}))}><div className="formGrid"><div className="field"><label>Alumno *</label><select name="student_id" required><option value="">Seleccionar…</option>{students.map((s:Row)=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><Sel name="concept" label="Concepto" value="monthly_fee" options={['monthly_fee','registration','costume','special_class','other']}/><F name="amount" label="Importe *" type="number" required/><F name="payment_date" label="Fecha" type="date" value={today()}/><Sel name="payment_method" label="Método" value="cash" options={['cash','transfer','card','other']}/><F name="reference" label="Referencia"/><TA name="notes" label="Notas"/><Save/></div></form>}
  if(modal.type==='expense'){title='Registrar gasto';body=<form onSubmit={submit('expenses',o=>({...o,amount:Number(o.amount),registered_by:profile.id}))}><div className="formGrid"><Sel name="category" label="Categoría" value="payroll" options={['payroll','rent','utilities','costumes','maintenance','advertising','other']}/><F name="amount" label="Importe *" type="number" required/><F name="expense_date" label="Fecha" type="date" value={today()}/><F name="description" label="Descripción"/><Sel name="payment_method" label="Método" value="transfer" options={['cash','transfer','card','other']}/><F name="reference" label="Referencia"/><TA name="notes" label="Notas"/><Save/></div></form>}
  return <div className="modal" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="dialog"><div className="dialogHead"><h2>{title}</h2><button className="close" onClick={close}>×</button></div>{body}</div></div>
}
function F({name,label,type='text',value='',required=false}:any){return <div className="field"><label>{label}</label><input name={name} type={type} defaultValue={value??''} required={required} step={type==='number'?'.01':undefined}/></div>}
function Sel({name,label,value,options}:any){return <div className="field"><label>{label}</label><select name={name} defaultValue={value}>{options.map((x:string)=><option key={x} value={x}>{x}</option>)}</select></div>}
function TA({name,label,value=''}:any){return <div className="field full"><label>{label}</label><textarea name={name} defaultValue={value??''}/></div>}
function Save(){return <div className="full right"><button className="btn primary">Guardar</button></div>}
