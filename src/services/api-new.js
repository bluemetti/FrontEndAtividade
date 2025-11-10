import { toast } from 'react-toastify'

// Configuração dos servidores
const SERVERS = {
  local: {
    name: import.meta.env.VITE_API_LOCAL_NAME || 'Local',
    url: import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:3001'
  },
  prod1: {
    name: import.meta.env.VITE_API_PROD1_NAME || 'Produção 1',
    url: import.meta.env.VITE_API_PROD1_URL || 'https://lifeless-spooky-gravestone-5gxpgr5vv95cvxv4-3001.app.github.dev'
  },
  prod2: {
    name: import.meta.env.VITE_API_PROD2_NAME || 'Produção 2',
    url: import.meta.env.VITE_API_PROD2_URL || ''
  }
}

const DEFAULT_SERVER = import.meta.env.VITE_DEFAULT_SERVER || 'local'

// Servidor ativo (pode ser alterado via localStorage)
let activeServer = localStorage.getItem('activeServer') || DEFAULT_SERVER

// Retorna o servidor ativo atual
function getActiveServer() {
  const server = SERVERS[activeServer]
  return server && server.url ? server.url : SERVERS.local.url
}

// Atualiza o servidor ativo
export function setActiveServer(serverKey) {
  if (SERVERS[serverKey] && SERVERS[serverKey].url) {
    activeServer = serverKey
    localStorage.setItem('activeServer', serverKey)
    toast.success(`Servidor alterado para: ${SERVERS[serverKey].name}`)
    return true
  }
  return false
}

// Retorna a lista de servidores disponíveis
export function getAvailableServers() {
  return Object.entries(SERVERS)
    .filter(([key, server]) => server.url)
    .map(([key, server]) => ({
      key,
      name: server.name,
      url: server.url,
      active: key === activeServer
    }))
}

// Retorna o servidor ativo
export function getCurrentServer() {
  return activeServer
}

// Faz requisição para um servidor
async function request(path, options = {}) {
  const serverUrl = getActiveServer()
  const token = localStorage.getItem('token')
  const headers = options.headers || {}
  headers['Content-Type'] = 'application/json'
  if(token) headers['Authorization'] = `Bearer ${token}`

  console.log('🌐 Requisição:', serverUrl + path, options.method || 'GET')

  const res = await fetch(serverUrl + path, {...options, headers})

  if(res.status === 401){
    toast.error('Não autorizado. Faça login novamente.')
    localStorage.removeItem('token')
    try{ window.location.href = '/login' }catch(e){}
    throw new Error('Unauthorized')
  }

  const text = await res.text()
  let data = null
  try{ data = text ? JSON.parse(text) : null }catch(e){ data = text }

  if(!res.ok){
    const msg = data && data.message ? data.message : `Erro ${res.status}`
    toast.error(msg)
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  
  console.log('✅ Resposta:', data)
  return data
}

export const api = {
  get: (path) => request(path, {method:'GET'}),
  post: (path, body) => request(path, {method:'POST', body: JSON.stringify(body)}),
  put: (path, body) => request(path, {method:'PUT', body: JSON.stringify(body)}),
  del: (path) => request(path, {method:'DELETE'})
}
