import React, { useState } from 'react'
import { api } from '../services/api'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import ServerSelector from '../components/ServerSelector'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    console.log('📝 [Register] Tentando registrar...')
    try{
      const data = await api.post('/register',{name,email,password})
      console.log('✅ [Register] Cadastro realizado:', data)
      toast.success('Cadastro realizado com sucesso! Faça login.')
      navigate('/login')
    }catch(err){
      console.error('❌ [Register] Erro:', err)
      // api já mostra toast no requestToServer, mas garantimos aqui também
      if(!err.message.includes('Erro')) {
        toast.error(err.message || 'Erro ao registrar')
      }
    }finally{setLoading(false)}
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Registrar</h2>
        <p className="muted">Crie sua conta para acessar o sistema</p>
        
        <ServerSelector />
        
        <form onSubmit={handleSubmit} className={loading? 'loading':''}>
          <input placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)} required />
          <input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
          <div className="row">
            <button type="submit" disabled={loading}>{loading? 'Cadastrando...':'Cadastrar'}</button>
          </div>
        </form>
        <p className="muted" style={{marginTop:16}}>
          Já tem conta? <Link to="/login">Faça login aqui</Link>
        </p>
      </div>
    </div>
  )
}
