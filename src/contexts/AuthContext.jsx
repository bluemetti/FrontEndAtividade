import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AuthContext = createContext()

function parseJwt(token){
  try{
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')))
    return decoded
  }catch(e){
    return null
  }
}

export function AuthProvider({children}){
  const [token, setToken] = useState(()=> localStorage.getItem('token'))
  const [user, setUser] = useState(()=>{
    const t = localStorage.getItem('token')
    if(!t) return null
    return parseJwt(t)
  })
  const navigate = useNavigate()

  const signIn = useCallback((jwt) =>{
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(parseJwt(jwt))
    toast.success('Login efetuado com sucesso!')
    navigate('/dashboard')
  },[navigate])

  const signOut = useCallback((reason)=>{
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    if(reason) toast.info(reason)
    navigate('/login')
  },[navigate])

  // auto logout quando token expira
  useEffect(()=>{
    if(!token) return
    const payload = parseJwt(token)
    if(!payload || !payload.exp){
      return
    }
    const expMs = payload.exp * 1000
    const now = Date.now()
    const msLeft = expMs - now
    if(msLeft <= 0){
      signOut('Sessão expirada')
      return
    }
    const timer = setTimeout(()=>{
      signOut('Sessão expirada')
    }, msLeft)
    return ()=> clearTimeout(timer)
  },[token, signOut])

  return (
    <AuthContext.Provider value={{token,user,signIn,signOut}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
