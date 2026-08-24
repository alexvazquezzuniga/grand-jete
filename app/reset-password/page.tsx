'use client'
import { FormEvent,useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ResetPassword(){
  const supabase=createClient(); const router=useRouter()
  const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e:FormEvent){
    e.preventDefault(); setError(''); setMessage('')
    if(password.length<8){setError('La contraseña debe tener al menos 8 caracteres.');return}
    if(password!==confirm){setError('Las contraseñas no coinciden.');return}
    setLoading(true); const {error}=await supabase.auth.updateUser({password}); setLoading(false)
    if(error){setError('El enlace no es válido o ya expiró. Solicita uno nuevo.');return}
    setMessage('Contraseña actualizada correctamente.'); setTimeout(()=>router.replace('/'),1200)
  }
  return <div className="loginWrap"><form className="loginCard" onSubmit={submit}>
    <img src="/grand-jete-logo.png" className="loginLogo" alt="Grand Jeté"/>
    <h1 style={{textAlign:'center',fontSize:22}}>Nueva contraseña</h1>
    <p className="sub" style={{textAlign:'center',marginBottom:22}}>Define una nueva contraseña para tu cuenta.</p>
    {error&&<div className="error">{error}</div>}{message&&<div className="success">{message}</div>}
    <div className="field"><label>Nueva contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>
    <div className="field"><label>Confirmar contraseña</label><input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
    <button className="btn primary" style={{width:'100%'}} disabled={loading}>{loading?'Guardando…':'Cambiar contraseña'}</button>
  </form></div>
}
