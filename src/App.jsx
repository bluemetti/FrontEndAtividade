import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './contexts/AuthContext'
import ServerSelector from './components/ServerSelector'

function Home(){
  return (
    <div className="container">
      <div className="card">
        <h2>Frontend - Atividade</h2>
        <p className="muted">Bem-vindo! Use o menu para entrar ou registrar uma conta.</p>
        
        <ServerSelector />
        
        <div style={{marginTop:16,display:'flex',gap:12}}>
          <Link to="/login" style={{textDecoration:'none'}}>
            <button>Login</button>
          </Link>
          <Link to="/register" style={{textDecoration:'none'}}>
            <button style={{background:'#10b981'}}>Registrar</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Protected({children}){
  const { token } = useAuth()
  if(!token) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
