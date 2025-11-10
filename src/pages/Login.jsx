import React, { useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ServerSelector from '../components/ServerSelector'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const { signIn } = useAuth()

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    console.log('🔐 [Login] Tentando fazer login...')
    try{
      const data = await api.post('/login',{email,password})
      console.log('✅ [Login] Resposta recebida:', data)
      
      // O backend retorna: { success: true, message: '...', data: { token: '...' } }
      const token = data.token || data.data?.token || data.data?.data?.token
      
      if(token){
        console.log('🎟️ [Login] Token recebido, fazendo signIn...')
        signIn(token)
      } else {
        console.warn('⚠️ [Login] Resposta sem token:', data)
        toast.error('Resposta inválida do servidor (sem token)')
      }
    }catch(err){
      console.error('❌ [Login] Erro:', err)
      toast.error(err.message || 'Erro ao fazer login')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <p className="muted">Entre com suas credenciais</p>
        
        <ServerSelector />
        
        <form onSubmit={handleSubmit} className={loading? 'loading':''}>
          <input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div className="row">
            <button type="submit" disabled={loading}>{loading? 'Entrando...':'Entrar'}</button>
          </div>
        </form>
        <p className="muted" style={{marginTop:16}}>
          Não tem conta? <Link to="/register">Registre-se aqui</Link>
        </p>
      </div>
    </div>
  )
}
