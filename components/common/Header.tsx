'use client'
export default function Header({title,sub,action,label}:{title:string,sub:string,action?:()=>void,label?:string}){
  return <div className="top"><div><h1>{title}</h1><div className="sub">{sub}</div></div>{action&&<button className="btn primary" onClick={action}>+ {label}</button>}</div>
}
