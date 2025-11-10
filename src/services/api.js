import { toast } from 'react-toastify'

// Build da configuração a partir das variáveis VITE_
const SERVERS = {
  local: {
    name: import.meta.env.VITE_API_LOCAL_NAME || 'Local',
    url: import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:3000'
  },
  prod1: {
    name: import.meta.env.VITE_API_PROD1_NAME || 'Produção 1',
    url: import.meta.env.VITE_API_PROD1_URL || ''
  },
  prod2: {
    name: import.meta.env.VITE_API_PROD2_NAME || 'Produção 2',
    url: import.meta.env.VITE_API_PROD2_URL || ''
  }
}

const DEFAULT_SERVER = import.meta.env.VITE_DEFAULT_SERVER || 'local'

// activeServer: chave (local | prod1 | prod2)
let activeServer = localStorage.getItem('activeServer') || DEFAULT_SERVER

function ensureServerUrl(key) {
  return (SERVERS[key] && SERVERS[key].url) ? SERVERS[key].url : null
}

export function getAvailableServers() {
  return Object.entries(SERVERS)
    .filter(([k]) => !!ensureServerUrl(k))
    .map(([k, v]) => ({ key: k, name: v.name, url: v.url, active: k === activeServer }))
}

export function getCurrentServerKey() {
  return activeServer
}

export function setActiveServer(key) {
  if (!SERVERS[key] || !SERVERS[key].url) return false
  activeServer = key
  localStorage.setItem('activeServer', key)
  toast.info(`Servidor ativo: ${SERVERS[key].name}`)
  return true
}

// retorna a url do servidor ativo
function getActiveServerUrl() {
  const url = ensureServerUrl(activeServer) || ensureServerUrl(DEFAULT_SERVER) || ensureServerUrl('local')
  return url
}

// Faz requisição a um servidor específico
async function requestToServer(serverUrl, path, options = {}){
  const token = localStorage.getItem('token')
  const headers = Object.assign({}, options.headers)
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = serverUrl.replace(/\/$/, '') + path
  
  console.log('🌐 [API] Fazendo requisição:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    body: options.body
  })

  try {
    const res = await fetch(url, {...options, headers})
    
    console.log('📡 [API] Resposta recebida:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    })

    if (res.status === 401) {
      toast.error('Não autorizado. Faça login novamente.')
      localStorage.removeItem('token')
      try{ window.location.href = '/login' }catch(e){}
      throw new Error('Unauthorized')
    }

    const text = await res.text()
    console.log('📄 [API] Corpo da resposta:', text)
    
    let data = null
    try { data = text ? JSON.parse(text) : null } catch(e){ 
      console.warn('⚠️ [API] Resposta não é JSON válido:', e)
      data = text 
    }

    if (!res.ok) {
      const msg = data && data.message ? data.message : `Erro ${res.status}`
      toast.error(msg)
      const err = new Error(msg)
      err.status = res.status
      err.data = data
      throw err
    }
    
    console.log('✅ [API] Sucesso:', data)
    return data
  } catch(error) {
    console.error('❌ [API] Erro na requisição:', error)
    
    // Se for erro de rede (fetch falhou)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      toast.error(`Erro de conexão com ${serverUrl}. Verifique se a API está rodando.`)
    }
    
    throw error
  }
}

// request padrão: para o servidor ativo
async function request(path, options = {}, { sendToAll = false } = {}){
  if (!sendToAll) {
    const serverUrl = getActiveServerUrl()
    return await requestToServer(serverUrl, path, options)
  }

  // envia para todos os servidores configurados (com url)
  const servers = Object.values(SERVERS).map(s => s.url).filter(Boolean)
  const promises = servers.map(surl => requestToServer(surl, path, options)
    .then(data => ({ success: true, data, server: surl }))
    .catch(error => ({ success: false, error, server: surl }))
  )

  const results = await Promise.all(promises)
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  if (successful.length > 0) {
    toast.success(`Enviado com sucesso para ${successful.length}/${servers.length} servidores`)
    return successful[0].data
  }

  failed.forEach(f => toast.error(`Erro em ${f.server}: ${f.error.message}`))
  throw new Error('Falha ao enviar para os servidores')
}

export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET' }, opts),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body: JSON.stringify(body) }, opts),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body: JSON.stringify(body) }, opts),
  del: (path, opts = {}) => request(path, { method: 'DELETE' }, opts),
  // opção para enviar para todos os servidores
  postAll: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }, { sendToAll: true })
}

export const serverConfig = {
  SERVERS,
  getAvailableServers,
  getCurrentServerKey,
  setActiveServer
}
