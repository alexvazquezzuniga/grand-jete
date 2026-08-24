export const money=(n:any)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n||0))
export const today=()=>new Date().toISOString().slice(0,10)
export const monthNow=()=>new Date().toISOString().slice(0,7)
